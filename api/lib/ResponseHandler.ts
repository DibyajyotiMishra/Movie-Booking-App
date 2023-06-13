import { Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { Crypto, logger } from "../lib";

export default abstract class ResponseHandler {
  protected router: Router;

  protected constructor() {
    this.router = Router();
  }

  public abstract register(): void;

  public send(res: Response, statusCode: number = StatusCodes.OK): void {
    let encData = {};
    encData = res.locals.data;
    if (
      environment.isProductionEnvironment() ||
      environment.isStagingEnvironment() ||
      environment.isTestEnvironment()
    ) {
      logger.info("RESPONSE DATA: " + JSON.stringify(encData, null, 2));
    }

    if (environment.applyEncryption) {
      encData = Crypto.encrypt(JSON.stringify(encData), process.env.SECRET_KEY);
    }

    res.status(statusCode).json({ data: encData });
  }
}
