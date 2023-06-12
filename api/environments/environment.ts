import * as fs from "fs";
import * as path from "path";
import { config as dotenvConfig } from "dotenv";
import IEnvironment from "./environment.d";
import { Environments, EnvironmentFile } from "./environment.constant";

export default class Environment implements IEnvironment {
  public port: number;
  public secretKey: string;
  public applyEncryption: boolean;
  public env: string;

  /**
   *  @param NODE_ENV
   */

  constructor(NODE_ENV?: string) {
    this.env = NODE_ENV || process.env.NODE_ENV || Environments.DEV;
    this.setEnvironment(this.env);
    const port: string | undefined | number = process.env.PORT || 8080;
    this.port = Number(port);
    this.applyEncryption = JSON.parse(process.env.APPLY_ENCRYPTION);
    this.secretKey = process.env.SECRET_KEY;
  }

  /**
   * @returns
   */
  public getCurrentEnvironment(): string {
    return this.env;
  }

  /**
   *
   * @param env
   */
  public setEnvironment(env: string): void {
    let envPath: string;
    this.env = env || Environments.LOCAL;
    const rootDir = path.resolve(__dirname, "../");

    switch (env) {
      case Environments.DEV:
        envPath = path.resolve(rootDir, EnvironmentFile.DEV);
        break;
      case Environments.LOCAL:
        envPath = path.resolve(rootDir, EnvironmentFile.LOCAL);
        break;
      case Environments.STAGING:
        envPath = path.resolve(rootDir, EnvironmentFile.STAGING);
        break;
      case Environments.TEST:
        envPath = path.resolve(rootDir, EnvironmentFile.TEST);
        break;
      case Environments.LOCAL:
        envPath = path.resolve(rootDir, EnvironmentFile.LOCAL);
        break;
      default:
        break;
    }

    if (!fs.existsSync(envPath)) {
      throw new Error(".env file is missing in root directory");
    }
    dotenvConfig({ path: envPath });
  }

  /**
   * @returns
   */
  public isDevEnvironment(): boolean {
    return (
      this.getCurrentEnvironment() === Environments.DEV ||
      this.getCurrentEnvironment() === Environments.LOCAL
    );
  }

  /**
   * @returns
   */
  public isProductionEnvironment(): boolean {
    return this.getCurrentEnvironment() === Environments.PROD;
  }

  /**
   * @returns
   */
  public isStagingEnvironment(): boolean {
    return this.getCurrentEnvironment() === Environments.STAGING;
  }

  /**
   * @returns
   */
  public isTestEnvironment(): boolean {
    return this.getCurrentEnvironment() === Environments.TEST;
  }
}
