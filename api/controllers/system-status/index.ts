import { NextFunction, Request, Response, Router } from "express";
import * as os from "os";
import * as process from "process";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { ApiError } from "../../interfaces";
import { ResponseHandler } from "../../lib";
import {
  IProcessInfoResponse,
  IResourceUsageResponse,
  IServerTimeResponse,
  ISystemInfoResponse,
} from "./index.d";

export default class SystemStatusController extends ResponseHandler {
  constructor() {
    super();
  }

  public register(): Router {
    this.router.get("/system", this.getSystemInfo.bind(this));
    this.router.get("/time", this.getServerTime.bind(this));
    this.router.get("/usage", this.getResourceUsage.bind(this));
    this.router.get("/process", this.getProcessInfo.bind(this));
    this.router.get("/error", this.getError.bind(this));

    return this.router;
  }

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  public getSystemInfo(req: Request, res: Response, next: NextFunction): void {
    try {
      const response: ISystemInfoResponse = {
        cpus: os.cpus(),
        network: os.networkInterfaces(),
        os: {
          platform: process.platform,
          version: os.release(),
          totalMemory: os.totalmem(),
          uptime: os.uptime(),
        },
        currentUser: os.userInfo(),
      };

      res.locals.data = response;
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  public getError(req: Request, res: Response, next: NextFunction): void {
    try {
      throw new ApiError(ReasonPhrases.BAD_REQUEST, StatusCodes.BAD_REQUEST);
    } catch (error) {
      next(error);
    }
  }

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  public getServerTime(req: Request, res: Response, next: NextFunction): void {
    try {
      const now: Date = new Date();
      const utc: Date = new Date(
        now.getTime() + now.getTimezoneOffset() + 60000
      );
      const time: IServerTimeResponse = {
        utc,
        date: now,
      };
      res.locals.send(time);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  public getResourceUsage(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    try {
      const totalMemory: number = os.totalmem();
      const processMemory: NodeJS.MemoryUsage = process.memoryUsage();
      const freeMemory: number = os.freemem();

      const response: IResourceUsageResponse = {
        processMemory,
        systemMemory: {
          free: freeMemory,
          total: totalMemory,
          percentFree: Math.round((freeMemory / totalMemory) * 100),
        },
        processCpu: process.cpuUsage(),
        systemCpu: os.cpus(),
      };

      res.locals.data = response;
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  public getProcessInfo(req: Request, res: Response, next: NextFunction): void {
    try {
      const response: IProcessInfoResponse = {
        procCpu: process.cpuUsage(),
        memUsage: process.memoryUsage(),
        env: process.env,
        pid: process.pid,
        uptime: process.uptime(),
        applicationVersion: process.version,
        nodeJsDependencyVersions: process.versions,
      };
      res.locals.data = response;
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
}
