enum Environments {
  LOCAL = "local",
  DEV = "development",
  STAGING = "staging",
  TEST = "testing",
  PROD = "production",
}

enum EnvironmentFile {
  LOCAL = ".env",
  DEV = ".env",
  STAGING = ".env.stag",
  TEST = ".env.test",
  PROD = ".env.prod",
}

export { Environments, EnvironmentFile };
