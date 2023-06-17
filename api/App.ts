import RedisStore from "connect-redis";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import session from "express-session";
import helmet from "helmet";
import { Server, createServer } from "http";
import swaggerUI from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import mongoose from "mongoose";
import * as redis from "redis";
import registerRoutes from "./routes";
import parseResponse from "./utils/parseResponse";
import { logger, Crypto } from "./lib";

class App {
  public express: Application;
  public httpServer: Server;
  public redisClient: ReturnType<typeof redis.createClient>;
  private redisStore: RedisStore;

  public async init(): Promise<void> {
    this.express = express();
    this.httpServer = createServer(this.express);
    this.setUpDatabase();
    this.setUpCacheDB();
    this.setupMiddleWares();
    this.registerApiRoutes();
    if (environment.isDevEnvironment() || environment.isTestEnvironment()) {
      this.setUpDocs();
    }
  }

  private setUpDatabase(): void {
    try {
      this.connectDBWithRetry();
    } catch (error) {
      logger.info("DB connection failed.");
      logger.info("Retrying connection...");
      setTimeout(() => {
        this.connectDBWithRetry();
      }, 5000);
    }
  }

  private setUpCacheDB(): void {
    try {
      this.redisClient = redis.createClient({
        socket: {
          host: process.env.REDIS_URL,
          port: Number(process.env.REDIS_PORT),
        },
      });
      this.connectWithRedisRetry();

      this.redisStore = new RedisStore({
        client: this.redisClient,
      });
    } catch (error) {
      logger.info("DB connection failed.");
      logger.info("Retrying connection...");
      setTimeout(() => {
        this.connectWithRedisRetry();
      }, 5000);
    }
  }

  private setupMiddleWares(): void {
    // helmet config
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

    // express json config
    this.express.use(
      express.json({
        limit: "20mb",
      })
    );

    // express url encoding config
    this.express.use(
      express.urlencoded({
        limit: "20mb",
        extended: true,
      })
    );

    // cors config
    const corsOptions = {
      origin: ["http://127.0.0.1:8080", "http://localhost:8080"],
    };
    this.express.use(cors(corsOptions));

    // express session config
    this.express.use(
      session({
        store: this.redisStore,
        resave: false,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET,
        cookie: {
          secure: false,
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        },
      })
    );
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

  private connectDBWithRetry(): void {
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

  private connectWithRedisRetry(): void {
    this.redisClient
      .connect()
      .then(() => {
        logger.info("Redis connected.");
        console.log("Cache DB connected...");
      })
      .catch((error: Error) => {
        logger.info("[FATAL]: Redis Connection failed");
        logger.error(error.name);
        logger.error(error.message);
        logger.error(error.stack);
        console.log("Cache DB connection unsuccessful");
      });
  }
}

export default App;
