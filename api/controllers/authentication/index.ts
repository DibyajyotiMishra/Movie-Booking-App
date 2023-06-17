import { NextFunction, Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { User as UserModel } from "../../models";
import User from "./../../entities/User";
import { ResponseHandler, logger } from "../../lib";
import ISession from "../../abstractions/Session";

export default class AuthenticationController extends ResponseHandler {
  constructor() {
    super();
  }

  public register(): Router {
    this.router.post("/signup", this.signUpWithEmailAndPassword.bind(this));
    this.router.post("/signin", this.signInWithEmailAndPassword.bind(this));
    this.router.get("/signout", this.signOut.bind(this));
    return this.router;
  }

  public async signUpWithEmailAndPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { fullName, email, phoneNumber, password } = req.body;
      const user: User = new User(fullName, email, phoneNumber, password);
      if (await this.userAccountExists(email)) {
        res.locals.data = {
          success: false,
          "session-id": req.sessionID,
          message: "Account already exists.",
        };
        super.send(res, StatusCodes.BAD_REQUEST);
        return;
      }
      const result = await this.saveUserData(user);
      if (result.success) {
        const userData = {
          fullName: user.getUser().fullName,
          email: user.getUser().email,
          phoneNumber: user.getUser().phoneNumber,
          uid: result.uid,
        };
        (req.session as ISession).user = userData;
        await this.updateUserLoginTime(email);

        res.locals.data = {
          success: true,
          "session-id": req.sessionID,
          message: "Welcome. You are now signed up!",
        };

        super.send(res, StatusCodes.CREATED);
      }
    } catch (error) {
      logger.info("Sign Up failed.");
      logger.error("Sign Up : Error: " + error.message);
      res.locals.data = {
        success: false,
        "session-id": req.sessionID,
        message: "Sign up failed. Try again later.",
      };
      super.send(res, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  public async signInWithEmailAndPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const userDoc = await UserModel.findOne({ email });
      if (!userDoc) {
        res.locals.data = {
          success: false,
          "session-id": req.sessionID,
          message: "User not found.",
        };
        super.send(res, StatusCodes.NOT_FOUND);
        return;
      }

      if (!this.checkPassword(userDoc, password)) {
        res.locals.data = {
          success: false,
          "session-id": req.sessionID,
          message: "User Credentials do not match.",
        };
        super.send(res, StatusCodes.UNPROCESSABLE_ENTITY);
        return;
      }

      const userData = {
        fullName: userDoc.fullName,
        email: userDoc.email,
        phoneNumber: userDoc.phoneNumber,
        uid: userDoc.id,
      };

      (req.session as ISession).user = userData;
      this.updateUserLoginTime(userData.uid);

      res.locals.data = {
        success: true,
        "session-id": req.sessionID,
        message: "Welcome. You are now signed in!",
      };

      super.send(res, StatusCodes.OK);
    } catch (error) {
      logger.info("Sign In failed.");
      logger.error("Sign In : Error: " + error.message);
      res.locals.data = {
        success: false,
        "session-id": req.sessionID,
        message: "Sign In failed. Try again later.",
      };
      super.send(res, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  public async signOut(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      req.session.destroy(_ => {
        req.session = null;
        res.locals.data = {
          success: true,
          "session-id": null,
          message: "User is signed out now.",
        };

        super.send(res, StatusCodes.OK);
      });
    } catch (error) {
      logger.info("Sign Out failed.");
      logger.error("signOut : Error: " + error.message);
      res.locals.data = {
        success: false,
        "session-id": req.sessionID,
        message: "Sign out failed. Try again later.",
      };

      super.send(res, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  private async saveUserData(
    user: User
  ): Promise<{ success: boolean; uid: string | null }> {
    try {
      const userDocument = new UserModel(user);
      userDocument.save();
      return {
        success: true,
        uid: userDocument.id,
      };
    } catch (error) {
      logger.info("Write to Database failed.");
      logger.error("saveUserData : Error: " + error.message);
      return {
        success: false,
        uid: null,
      };
    }
  }

  private async userAccountExists(email: User["email"]): Promise<boolean> {
    try {
      const userDocument = await UserModel.findOne({ email });
      if (!userDocument) {
        return false;
      }
      return true;
    } catch (error) {
      logger.info("User Account look up failed.");
      logger.error("userAccountExists : Error: " + error.message);
      return false;
    }
  }

  private checkPassword(userDoc, password: string): boolean {
    if (userDoc.authenticate(password)) {
      return true;
    }
    return false;
  }

  private async updateUserLoginTime(email: string): Promise<void> {
    try {
      await UserModel.findOneAndUpdate(
        { email },
        { lastLogin: new Date().toLocaleString("en-GB") },
        {
          new: true,
        }
      );
    } catch (error) {
      logger.info("Login Time update failed.");
      logger.error("updateUserLoginTime : Error: " + error.message);
    }
  }
}
