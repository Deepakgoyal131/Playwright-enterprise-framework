import type { Browser, BrowserContext } from "@playwright/test";
import { ErrorHandler, ErrorType } from "../core/errors";
import type { AuthenticationConfig } from "../../configs/types/FrameworkConfig.types";
import { SessionManager } from "./SessionManager";
import { FrameworkError } from "../core/errors/FrameworkError";
import type {
  AuthSession,
  AuthStrategy,
  AuthStrategyResult,
  AuthUser,
} from "./types/Auth.types";

export class AuthenticationManager {
  private readonly sessionManager: SessionManager;

  public constructor(
    private readonly config: AuthenticationConfig,
    private readonly strategies: Partial<
      Record<"ui" | "api" | "custom", AuthStrategy>
    >,
  ) {
    this.sessionManager = new SessionManager(
      config.sessionDirectory,
      config.expirationSkewSeconds,
    );
  }

  public async getSession(
    user: AuthUser,
    browser: Browser,
  ): Promise<AuthSession> {
    if (!this.config.enabled) {
      ErrorHandler.handle(
        ErrorType.FRAMEWORK,
        "AuthenticationManager.getSession",
        "Authentication is disabled in FrameworkConfig.",
        new Error("Authentication is disabled."),
      );
    }

    const strategy = this.strategies[this.config.strategy];
    if (!strategy) {
      ErrorHandler.handle(
        ErrorType.FRAMEWORK,
        "AuthenticationManager.getSession",
        `No implementation is registered for the '${this.config.strategy}' authentication strategy.`,
        new Error("Authentication strategy implementation is unavailable."),
      );
    }

    const stored = this.config.reuseStorageState
      ? this.sessionManager.load(user)
      : { status: "missing" as const };

    if (stored.status === "valid") {
      const context = await browser.newContext({
        storageState: stored.session.storageState,
        extraHTTPHeaders: stored.session.record.headers,
      });
      let sessionIsValid = true;
      try {
        sessionIsValid = strategy.validateSession
          ? await strategy.validateSession(
              user,
              context,
              stored.session.record.headers,
            )
          : true;
      } catch {
        sessionIsValid = false;
      }
      if (sessionIsValid) {
        return this.toSession(
          user,
          context,
          stored.session.record.headers,
          stored.session.storageStatePath,
          stored.session.storageState,
        );
      }
      await context.close().catch(() => undefined);
      if (!this.config.refreshExpiredSession) {
        ErrorHandler.handle(
          ErrorType.FRAMEWORK,
          "AuthenticationManager.getSession",
          "The saved authentication session was rejected and automatic refresh is disabled.",
          new Error("Saved authentication session is stale."),
        );
      }
      this.sessionManager.remove(user);
    }

    if (
      (stored.status === "expired" || stored.status === "invalid") &&
      !this.config.refreshExpiredSession
    ) {
      ErrorHandler.handle(
        ErrorType.FRAMEWORK,
        "AuthenticationManager.getSession",
        "The saved authentication session is expired or invalid and automatic refresh is disabled.",
        new Error("Saved authentication session is not reusable."),
      );
    }

    if (stored.status !== "missing") {
      this.sessionManager.remove(user);
    }

    const context = await browser.newContext();
    try {
      const result = await strategy.authenticate(user, context);
      if (result.headers && Object.keys(result.headers).length > 0) {
        await context.setExtraHTTPHeaders(result.headers);
      }
      const expiresAt = this.resolveExpiration(result);
      if (expiresAt <= Date.now() + this.config.expirationSkewSeconds * 1000) {
        ErrorHandler.handle(
          ErrorType.FRAMEWORK,
          "AuthenticationManager.getSession",
          "The authentication strategy returned an expired session.",
          new Error("Authentication strategy returned an expired session."),
        );
      }
      const storageState = await context.storageState();
      const storageStatePath = this.config.reuseStorageState
        ? await this.sessionManager.save(
            user,
            result.headers ?? {},
            storageState,
            expiresAt,
          )
        : "";
      return this.toSession(
        user,
        context,
        result.headers ?? {},
        storageStatePath,
        storageState,
      );
    } catch (error) {
      await context.close().catch(() => undefined);
      if (error instanceof FrameworkError) {
        throw error;
      }
      ErrorHandler.handle(
        ErrorType.FRAMEWORK,
        "AuthenticationManager.getSession",
        "Authentication failed. Sensitive credential and response details were omitted.",
        new Error("Authentication strategy failed."),
      );
    }
  }

  public invalidate(user: AuthUser): void {
    this.sessionManager.remove(user);
  }

  private resolveExpiration(result: AuthStrategyResult): number {
    const configuredExpiry =
      Date.now() + this.config.sessionLifetimeSeconds * 1000;
    if (!result.expiresAt || !Number.isFinite(result.expiresAt)) {
      return configuredExpiry;
    }
    return Math.min(result.expiresAt, configuredExpiry);
  }

  private toSession(
    user: AuthUser,
    context: BrowserContext,
    headers: Record<string, string>,
    storageStatePath: string,
    storageState: Awaited<ReturnType<BrowserContext["storageState"]>>,
  ): AuthSession {
    return {
      user,
      context,
      headers,
      storageStatePath,
      storageState,
    };
  }
}
