// TODO: replace console.logs with loggers

import * as http from "http";
import { AddressInfo } from "net";
import { setGlobalEnvironment } from "./global";
import App from "./App";
import Environment from "./environments/environment";
import logger from "./lib/logger";

const environment: Environment = new Environment();
setGlobalEnvironment(environment);
const app: App = new App();
let server: http.Server;

function serverError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== "listen") {
    throw error;
  }
  // handle specific errors here
  logger.info("Error: " + error.message);
  logger.error(error.stack);
  throw error;
}

function serverListening(): void {
  const addressInfo: AddressInfo = <AddressInfo>server.address();
  logger.info(
    `Server is up  and listening on ${addressInfo.address}:${environment.port}`
  );
}

app
  .init()
  .then(function (): void {
    app.express.set("port", environment.port);
    server = app.httpServer;
    server.on("error", serverError);
    server.on("listening", serverListening);
    server.listen(environment.port);
  })
  .catch(function (error: Error): void {
    logger.info("app.init error");
    logger.error(error.name);
    logger.error(error.message);
    logger.error(error.stack);
  });

process.on("unhandledRejection", function (exception: Error) {
  logger.info("Unhandled Promise Rejection reason: ", exception.message);
  logger.error(exception.stack);
  // other ways to handle exception.
});
