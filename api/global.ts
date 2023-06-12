import Environment from "./environments/environment";

declare global {
  var environment: Environment;
}

/**
 *
 * @param environment
 * @returns
 */
export function setGlobalEnvironment(environment: Environment): void {
  global.environment = environment;
}
