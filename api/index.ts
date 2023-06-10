import express, { Application, Request, Response } from "express";
import config from "./config";

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
  return res.send("Hey there 👋, from API.");
});

app.listen(config.PORT, () =>
  console.log(`App is up and running on PORT: ${config.PORT}  🚀`)
);
