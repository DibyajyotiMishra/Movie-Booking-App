const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const chalk = require("chalk");

const envFile = "./env";
if (!fs.existsSync(envFile)) {
  console.log(chalk.yellow("[FATAL] .env file not found"));
  console.log(chalk.blue("Creating .env file..."));
  exec("touch .env", () => console.log(chalk.green(".env file is created")));
  const writer = fs.createWriteStream(".env", {
    flags: "a",
  });
  writer.write("PORT=8080\n");
  writer.write("NODE_ENV=development\n");
  console.log(
    chalk.gray(
      "Adding default environment variables to .env, you can edit further."
    )
  );

  console.log(chalk.greenBright("Added default environment variables..."));
}
