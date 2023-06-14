import "winston-mongodb";
import { existsSync, mkdirSync } from "fs";
import winston, { Logger, format } from "winston";
import Environment from "../environments/environment";

const logDir = "./.logs";

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

const environment: Environment = new Environment();

const devLogger: Logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: `${logDir}/${environment.getCurrentEnvironment()}.log`,
      format: format.combine(
        format.timestamp({
          format: "DD-MMM-YYYY HH:mm:ss",
        }),
        format.align(),
        format.printf(
          info => `${info.level}: ${[info.timestamp]}: ${info.message}`
        )
      ),
    }),
  ],
});

const prodLogger: Logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.MongoDB({
      level: "error",
      db: `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_IP}:${process.env.MONGODB_PORT}/logs?authSource=admin`,
      options: {
        useUnifiedTopology: true,
      },
      collection: "error_logs",
      format: format.combine(format.timestamp(), format.json()),
    }),
    new winston.transports.MongoDB({
      level: "info",
      db: `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_IP}:${process.env.MONGODB_PORT}/logs?authSource=admin`,
      options: {
        useUnifiedTopology: true,
      },
      collection: "info_logs",
      format: format.combine(format.timestamp(), format.json()),
    }),
    new winston.transports.MongoDB({
      level: "warn",
      db: `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_IP}:${process.env.MONGODB_PORT}/logs?authSource=admin`,
      options: {
        useUnifiedTopology: true,
      },
      collection: "warn_logs",
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

const logger = environment.isDevEnvironment() ? devLogger : prodLogger;

export default logger;
