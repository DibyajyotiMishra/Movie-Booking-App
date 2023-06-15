import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { Server, createServer } from "http";
import swaggerUI from "swagger-ui-express";
import Crypto from "./lib/crypto";
import registerRoutes from "./routes";
import parseResponse from "./utils/parseResponse";
import swaggerDocument from "./swagger.json";

class App {
  public express: Application;
  public httpServer: Server;

  public async init(): Promise<void> {
    this.express = express();
    this.httpServer = createServer(this.express);
    this.setupMiddleWares();
    this.registerApiRoutes();
    if (environment.isDevEnvironment() || environment.isTestEnvironment()) {
      this.setUpDocs();
    }
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
    this.express.use("/api/v1", this.parseRequest, registerRoutes());
    this.express.post("/api/v1/parse", this.parseRequest, parseResponse);
  }

  private parseRequest(
    request: Request,
    response: Response,
    next: NextFunction
  ): void | Response {
    const apiKey = request.header("x-api-key");
    if (apiKey !== process.env.API_KEY) {
      return response.status(422).json({
        data: "Err!! Bad Request.",
      });
    }

    if (request.body.data) {
      const decryptedRequestBody = Crypto.decrypt(
        request.body.data,
        process.env.SECRET_KEY
      );
      request.body = decryptedRequestBody;
    }

    next();
  }

  private setUpDocs(): void {
    const swaggerOptions: swaggerUI.SwaggerOptions = {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Movie Booking Application",
    };

    this.express.use(
      "/docs",
      swaggerUI.serve,
      swaggerUI.setup(swaggerDocument, swaggerOptions)
    );
  }
}

export default App;
