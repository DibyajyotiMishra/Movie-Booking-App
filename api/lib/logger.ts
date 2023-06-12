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

export default devLogger;
