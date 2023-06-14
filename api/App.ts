import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { Server, createServer } from "http";
import mongoose from "mongoose";
import registerRoutes from "./routes";
import parseResponse from "./utils/parseResponse";
import { logger, Crypto } from "./lib";

class App {
  public express: Application;
  public httpServer: Server;

  public async init(): Promise<void> {
    this.express = express();
    this.httpServer = createServer(this.express);
    this.setUpDatabase();
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
      const clientDetails = {
        ips: request.ips,
        ip: request.ip,
        hostName: request.hostname,
        method: request.method,
        httpVersion: request.httpVersion,
        apiKey: request.header("x-api-key"),
        headers: request.headers,
      };

      logger.error("Error: API key missing!");
      logger.warn("Error: API key missing!");
      logger.warn("Client Details: " + JSON.stringify(clientDetails));

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

  private setUpDatabase(): void {
    try {
      this.connectWithRetry();
    } catch (error) {
      logger.info("DB connection failed.");
      logger.info("Retrying connection...");
      setTimeout(() => {
        this.connectWithRetry();
      }, 5000);
    }
  }

  private connectWithRetry(): void {
    const mongoUri = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_IP}:${process.env.MONGODB_PORT}/?authSource=admin`;
    mongoose
      .connect(mongoUri)
      .then(() => {
        logger.info("MongoDB connected.");
        console.log("DB connected...");
      })
      .catch((error: Error) => {
        logger.info("[FATAL]: DB Connection failed");
        logger.error(error.name);
        logger.error(error.message);
        logger.error(error.stack);
        console.log("DB connection unsuccessful");
      });
  }
}

export default App;
