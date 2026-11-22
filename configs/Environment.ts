import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { FrameworkConfig } from "./FrameworkConfig";
import { ErrorHandler, ErrorType } from "../src/core/errors";
import type { FrameworkEnvironmentName } from "./types/FrameworkConfig.types";
import {
  resolveEnvironmentFileName,
  resolveEnvironmentName,
  resolveExecutionProfile,
  shouldExcludeDestructiveProductionTests,
} from "../src/core/utils/EnvironmentResolver";
import { validateFrameworkInputs } from "../src/core/utils/FrameworkValidation";
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
  private static _frameworkEnvironment: FrameworkEnvironmentName =
    FrameworkConfig.environment.default;
  /**
   * Initialize environment configuration.
   * Should be called only once during framework startup.
   */
  public static initialize(): void {
    if (this.initialized) {
      return;
    }

    const environment = resolveEnvironmentName(
      process.env.FRAMEWORK_ENV,
      FrameworkConfig.environment.default,
    );
    if (!environment) {
      ErrorHandler.handle(
        ErrorType.FRAMEWORK,
        "Environment.initialize",
        "Invalid FRAMEWORK_ENV. Supported values are local, dev, qa, uat, staging, and production (prod is a supported alias).",
        new Error("Unsupported framework environment."),
      );
    }

    const envFile = path.resolve(
      process.cwd(),
      "configs",
      "env",
      resolveEnvironmentFileName(environment),
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

  public static validate(): void {
    const issues = validateFrameworkInputs(
      this.frameworkEnvironment,
      process.env,
      FrameworkConfig,
    );
    if (issues.length > 0) {
      ErrorHandler.handle(
        ErrorType.FRAMEWORK,
        "Environment.validate",
        issues.join(" "),
        new Error("Environment configuration validation failed."),
      );
    }
  }

  public static get isProduction(): boolean {
    return this._frameworkEnvironment === "production";
  }

  public static get shouldExcludeDestructiveTests(): boolean {
    return shouldExcludeDestructiveProductionTests(
      this._frameworkEnvironment,
      process.env,
      FrameworkConfig,
    );
  }

  private static get executionProfile() {
    return resolveExecutionProfile(
      this._frameworkEnvironment,
      this.isCI,
      FrameworkConfig,
    );
  }

  public static get retries(): number {
    return this.executionProfile.retries;
  }

  public static get workers(): string | number {
    return this.executionProfile.workers;
  }

  public static get fullyParallel(): boolean {
    return this.executionProfile.fullyParallel;
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
    return this.retries;
  }
}
