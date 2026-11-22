import {
  request,
  type APIRequestContext,
  type BrowserContext,
} from "@playwright/test";
import { ErrorHandler, ErrorType } from "../../core/errors";
import { Logger } from "../../core/logger";
import { APIClient } from "../../api/APIClient";
import type { APIAuthenticationConfig } from "../../../configs/types/FrameworkConfig.types";
import type {
  AuthStrategy,
  AuthStrategyResult,
  AuthUser,
} from "../types/Auth.types";

export class APIAuthStrategy implements AuthStrategy {
  public constructor(
    private readonly config: APIAuthenticationConfig,
    private readonly apiURL: string,
    private readonly timeout: number,
    private readonly defaultSessionLifetimeSeconds: number,
  ) {}

  public async authenticate(
    user: AuthUser,
    _context: BrowserContext,
  ): Promise<AuthStrategyResult> {
    const requestContext = await request.newContext({
      baseURL: this.apiURL,
      timeout: this.timeout,
    });

    try {
      const client = new APIClient(requestContext, {
        captureAllureDetails: false,
      });
      const response = await client.post(this.config.loginEndpoint, {
        data: this.resolvePayload(user),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok()) {
        ErrorHandler.handle(
          ErrorType.API,
          "APIAuthStrategy.authenticate",
          `API authentication returned HTTP ${response.status()}.`,
          new Error(
            "Authentication endpoint rejected the configured credentials.",
          ),
        );
      }

      const payload: unknown = await response.json();
      const tokenValue = getJsonPath(payload, this.config.tokenJsonPath);
      if (typeof tokenValue !== "string" || tokenValue.length === 0) {
        ErrorHandler.handle(
          ErrorType.FRAMEWORK,
          "APIAuthStrategy.authenticate",
          "The configured token path did not resolve to a non-empty string.",
          new Error("Authentication token was missing from the response."),
        );
      }

      const prefix = this.config.tokenPrefix.trim();
      const value = prefix ? `${prefix} ${tokenValue}` : tokenValue;
      const expiryValue = this.config.tokenExpiryJsonPath
        ? getJsonPath(payload, this.config.tokenExpiryJsonPath)
        : undefined;
      const expiresAt = parseExpiration(expiryValue);

      Logger.info(
        "API authentication completed; credentials and tokens were omitted.",
      );
      return {
        headers: { [this.config.tokenHeaderName]: value },
        expiresAt:
          expiresAt ?? Date.now() + this.defaultSessionLifetimeSeconds * 1000,
      };
    } catch (error) {
      return ErrorHandler.handle(
        ErrorType.API,
        "APIAuthStrategy.authenticate",
        "API authentication failed. Verify the configured endpoint and response mapping.",
        new Error("API authentication failed; sensitive values were omitted.", {
          cause: error instanceof Error ? error.name : undefined,
        }),
      );
    } finally {
      try {
        await requestContext.dispose();
      } catch {
        Logger.warn(
          "Could not dispose the temporary API authentication context.",
        );
      }
    }
  }

  public async validateSession(
    _user: AuthUser,
    context: BrowserContext,
    headers: Readonly<Record<string, string>>,
  ): Promise<boolean> {
    if (!this.config.sessionValidationEndpoint) {
      return true;
    }

    let requestContext: APIRequestContext | undefined;
    try {
      requestContext = await request.newContext({
        baseURL: this.apiURL,
        timeout: this.timeout,
        storageState: await context.storageState(),
        extraHTTPHeaders: { ...headers },
      });
      const client = new APIClient(requestContext, {
        captureAllureDetails: false,
      });
      const response = await client.get(this.config.sessionValidationEndpoint);
      return response.ok();
    } catch {
      return false;
    } finally {
      await requestContext?.dispose().catch(() => undefined);
    }
  }

  private resolvePayload(user: AuthUser): Record<string, unknown> {
    const replace = (value: unknown): unknown => {
      if (typeof value === "string") {
        return value.replace(
          /\{\{(username|password)\}\}/g,
          (_match, key: string) =>
            key === "username"
              ? user.credentials.username
              : user.credentials.password,
        );
      }
      if (Array.isArray(value)) {
        return value.map(replace);
      }
      if (value && typeof value === "object") {
        return Object.fromEntries(
          Object.entries(value).map(([key, child]) => [key, replace(child)]),
        );
      }
      return value;
    };

    return replace(this.config.requestPayload) as Record<string, unknown>;
  }
}

function getJsonPath(value: unknown, path: string): unknown {
  if (!path.trim()) {
    return undefined;
  }
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }
    return (current as Record<string, unknown>)[key];
  }, value);
}

function parseExpiration(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 10_000_000_000 ? value * 1000 : value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}
