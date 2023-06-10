import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { Server, createServer } from "http";

class App {
  public express: Application;
  public httpServer: Server;

  public async init(): Promise<void> {
    this.express = express();
    this.httpServer = createServer(this.express);
    this.setupMiddleWares();
    this.registerApiRoutes();
  }

  private setupMiddleWares(): void {
    this.express.use(
      helmet({
        contentSecurityPolicy: false,
        referrerPolicy: {
          policy: "no-referrer",
        },
        xContentTypeOptions: true,
        xFrameOptions: {
          action: "sameorigin",
        },
      })
    );
    this.express.use(
      express.json({
        limit: "20mb",
      })
    );
    this.express.use(
      express.urlencoded({
        limit: "20mb",
        extended: true,
      })
    );
    const corsOptions = {
      origin: ["http://127.0.0.1:8080", "http://localhost:8080"],
    };
    this.express.use(cors(corsOptions));
  }

  private registerApiRoutes(): void {
    this.express.get("/api/v1", this.baseRoute);
    this.express.get("/api/v1/web", this.parseRequestHeaders, this.baseRoute);
    console.log("register the routes here...");
  }

  private baseRoute(request: Request, response: Response): void {
    response.status(204).json({
      data: `Hey there, this is the base route, checkout docs for more information...`,
    });
  }

  private parseRequestHeaders(
    request: Request,
    response: Response,
    next: NextFunction
  ): void {
    console.log("Perform your needed actions with request headers");
    console.log(request.headers);
    next();
  }
}

export default App;
