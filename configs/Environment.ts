import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

/**
 * Centralized Environment Configuration Manager.
 *
 * Responsibilities:
 *  - Load the selected environment file.
 *  - Validate required variables.
 *  - Provide strongly typed getters.
 *
 * Usage:
 *   Environment.initialize();
 *   const url = Environment.baseURL;
 */
export class Environment {
  private static initialized = false;
  private static _isCI = false;
  /**
   * Initialize environment configuration.
   * Should be called only once during framework startup.
   */
  public static initialize(): void {
    if (this.initialized) {
      return;
    }

    const environment = process.env.FRAMEWORK_ENV || "qa";

    const envFile = path.resolve(
      process.cwd(),
      "configs",
      "env",
      `.env.${environment}`
    );

    if (!fs.existsSync(envFile)) {
      throw new Error(
        `Environment file not found: ${envFile}`
      );
    }

    dotenv.config({ path: envFile });

    this.validate();

    this.initialized = true;

    this._isCI = process.env.CI?.toLowerCase() === "true";
  }

  /**
   * Validate mandatory environment variables.
   */
  private static validate(): void {
    const required = [
      "BASE_URL",
      "API_URL",
      "USERNAME",
      "PASSWORD",
      "HEADLESS",
    ];

    const missing = required.filter(
      key => !process.env[key]?.trim()
    );

    if (missing.length > 0) {
      throw new Error(
        `Missing environment variables:\n${missing.join("\n")}`
      );
    }
  }

  public static get baseURL(): string {
    return process.env.BASE_URL!;
  }

  public static get apiURL(): string {
    return process.env.API_URL!;
  }

  public static get username(): string {
    return process.env.USERNAME!;
  }

  public static get password(): string {
    return process.env.PASSWORD!;
  }

  public static get headless(): boolean {
    return process.env.HEADLESS === "true";
  }
  public static get isCI(): boolean {
    return this._isCI;
  }
}