import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { FrameworkConfig } from "./FrameworkConfig";
import { ErrorHandler, ErrorType } from "../src/core/errors";
import {
  isSupportedFrameworkEnvironment,
  validateFrameworkInputs,
} from "../src/core/utils/FrameworkValidation";
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
  private static _frameworkEnvironment = "qa";
  /**
   * Initialize environment configuration.
   * Should be called only once during framework startup.
   */
  public static initialize(): void {
    if (this.initialized) {
      return;
    }

    const environment = process.env.FRAMEWORK_ENV?.trim().toLowerCase() || "qa";
    if (!isSupportedFrameworkEnvironment(environment)) {
      ErrorHandler.handle(
        ErrorType.FRAMEWORK,
        "Environment.initialize",
        "Invalid FRAMEWORK_ENV. Supported values are dev, qa, uat, and prod.",
        new Error("Unsupported framework environment."),
      );
    }

    const envFile = path.resolve(
      process.cwd(),
      "configs",
      "env",
      `.env.${environment}`,
    );

    if (!fs.existsSync(envFile)) {
      ErrorHandler.handle(
        ErrorType.FRAMEWORK,
        "Environment.initialize",
        `Environment file for '${environment}' was not found.`,
        new Error("Selected environment file is missing."),
      );
    }

    dotenv.config({ path: envFile });

    const issues = validateFrameworkInputs(
      environment,
      process.env,
      FrameworkConfig,
    );
    if (issues.length > 0) {
      ErrorHandler.handle(
        ErrorType.FRAMEWORK,
        "Environment.initialize",
        issues.join(" "),
        new Error("Framework environment or configuration validation failed."),
      );
    }

    this.initialized = true;

    this._frameworkEnvironment = environment;
    this._isCI = process.env.CI?.toLowerCase() === "true";
  }

  /**
   * Validate mandatory environment variables.
   */
  public static get frameworkEnvironment(): string {
    return this._frameworkEnvironment;
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
    return process.env.HEADLESS?.toLowerCase() === "true";
  }
  public static get isCI(): boolean {
    return this._isCI;
  }

  public static get retryCount(): number {
    return this.isCI ? FrameworkConfig.retry.ci : FrameworkConfig.retry.local;
  }
}
