import { createServer } from "node:http";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { Browser, BrowserContext } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { FrameworkConfig } from "../../configs/FrameworkConfig";
import type { AuthenticationConfig } from "../../configs/types/FrameworkConfig.types";
import { validateFrameworkInputs } from "../../src/core/utils/FrameworkValidation";
import {
  AuthenticationManager,
  resolveAuthUser,
  SessionManager,
} from "../../src/auth";
import { APIAuthStrategy } from "../../src/auth/strategies/APIAuthStrategy";
import { UIAuthStrategy } from "../../src/auth/strategies/UIAuthStrategy";
import type {
  AuthStrategy,
  AuthStrategyResult,
  AuthUser,
} from "../../src/auth/types/Auth.types";

test.describe("Authentication and session management", () => {
  test("resolves role credentials from environment mappings without echoing values", () => {
    const config = authConfig({
      users: {
        operator: {
          usernameEnv: "TEST_OPERATOR_USER",
          passwordEnv: "TEST_OPERATOR_PASSWORD",
        },
      },
    });
    const environment = {
      TEST_OPERATOR_USER: "sample-user-secret",
      TEST_OPERATOR_PASSWORD: "sample-password-secret",
    };

    expect(resolveAuthUser("operator", config, environment)).toEqual({
      id: "sample-user-secret",
      role: "operator",
      credentials: {
        username: "sample-user-secret",
        password: "sample-password-secret",
      },
    });

    expect(() => resolveAuthUser("missing-role", config, environment)).toThrow(
      "No authentication environment mapping is configured for role 'missing-role'.",
    );
    expect(() => resolveAuthUser("operator", config, {})).toThrow(
      "Credentials are missing for authentication role 'operator'. Configure the mapped environment variables.",
    );
  });

  test("validates incomplete UI and API authentication configuration", () => {
    const environment = validEnvironment();
    const uiConfig = {
      ...FrameworkConfig,
      authentication: {
        ...FrameworkConfig.authentication,
        enabled: true,
        strategy: "ui" as const,
      },
    };
    expect(validateFrameworkInputs("qa", environment, uiConfig)).toContain(
      "UI authentication requires a login path and configured login and authenticated-state selectors.",
    );

    const apiConfig = {
      ...FrameworkConfig,
      authentication: {
        ...FrameworkConfig.authentication,
        enabled: true,
        strategy: "api" as const,
      },
    };
    expect(validateFrameworkInputs("qa", environment, apiConfig)).toContain(
      "API authentication requires tokenJsonPath and tokenHeaderName.",
    );
  });

  test("fails safely when the configured authentication strategy is unavailable", async () => {
    const config = authConfig({ reuseStorageState: false });
    const manager = new AuthenticationManager(config, {});

    await expect(
      manager.getSession(authUser("operator", "user-operator"), {} as Browser),
    ).rejects.toThrow(
      "No implementation is registered for the 'custom' authentication strategy.",
    );
  });

  test("reports missing, invalid, and expired storage state distinctly", async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "auth-state-"));
    const manager = new SessionManager(directory, 30);
    const user = authUser("analyst", "user-a");
    const state = { cookies: [], origins: [] } as Awaited<
      ReturnType<BrowserContext["storageState"]>
    >;

    try {
      expect(manager.load(user).status).toBe("missing");

      const expiredPath = await manager.save(
        user,
        {},
        state,
        Date.now() - 1000,
      );
      expect(manager.load(user).status).toBe("expired");

      fs.writeFileSync(expiredPath, "not-json");
      expect(manager.load(user).status).toBe("invalid");
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  test("does not silently reuse expired state when refresh is disabled", async () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "auth-no-refresh-"),
    );
    const user = authUser("reviewer", "user-reviewer");
    const sessionManager = new SessionManager(directory, 0);
    const state = { cookies: [], origins: [] } as Awaited<
      ReturnType<BrowserContext["storageState"]>
    >;
    const config = authConfig({
      sessionDirectory: directory,
      refreshExpiredSession: false,
    });

    try {
      await sessionManager.save(user, {}, state, Date.now() - 1);
      const manager = new AuthenticationManager(config, {
        custom: {
          async authenticate() {
            return {};
          },
        },
      });
      await expect(manager.getSession(user, {} as Browser)).rejects.toThrow(
        "The saved authentication session is expired or invalid and automatic refresh is disabled.",
      );
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  test("generates and reuses separate storageState sessions by role", async ({
    browser,
  }) => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "auth-reuse-"));
    const config = authConfig({ sessionDirectory: directory });
    let authenticationCount = 0;
    const strategy: AuthStrategy = {
      async authenticate(_user, context): Promise<AuthStrategyResult> {
        authenticationCount += 1;
        await context.addCookies([
          {
            name: "session-marker",
            value: `session-${authenticationCount}`,
            domain: "example.test",
            path: "/",
            expires: Date.now() / 1000 + 3600,
            httpOnly: true,
            secure: true,
            sameSite: "Lax",
          },
        ]);
        return {};
      },
    };
    const manager = new AuthenticationManager(config, { custom: strategy });
    const operator = authUser("operator", "same-user");
    const auditor = authUser("auditor", "same-user");
    let operatorStatePath = "";
    let auditorStatePath = "";

    try {
      const firstSession = await manager.getSession(operator, browser);
      operatorStatePath = firstSession.storageStatePath;
      expect(firstSession.storageState.cookies).toHaveLength(1);
      await firstSession.context.close();

      const reusedSession = await manager.getSession(operator, browser);
      expect(authenticationCount).toBe(1);
      expect(reusedSession.storageState.cookies[0]?.value).toBe("session-1");
      await reusedSession.context.close();

      const secondRoleSession = await manager.getSession(auditor, browser);
      auditorStatePath = secondRoleSession.storageStatePath;
      expect(authenticationCount).toBe(2);
      expect(auditorStatePath).not.toBe(operatorStatePath);
      await secondRoleSession.context.close();
    } finally {
      manager.invalidate(operator);
      manager.invalidate(auditor);
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  test("performs configured UI login and reuses its cookie storageState", async ({
    browser,
  }) => {
    let loginAttempts = 0;
    const server = createServer((incomingRequest, response) => {
      const requestUrl = new URL(
        incomingRequest.url ?? "/",
        "http://localhost",
      );
      if (
        incomingRequest.method === "GET" &&
        requestUrl.pathname === "/login"
      ) {
        response.setHeader("content-type", "text/html");
        response.end(
          '<form method="post" action="/login"><input id="user" name="username"><input id="pass" name="password"><button id="submit">Sign in</button></form>',
        );
        return;
      }

      if (
        incomingRequest.method === "POST" &&
        requestUrl.pathname === "/login"
      ) {
        const chunks: Buffer[] = [];
        incomingRequest.on("data", (chunk: Buffer | string) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        incomingRequest.on("end", () => {
          const submitted = new URLSearchParams(
            Buffer.concat(chunks).toString("utf8"),
          );
          if (
            submitted.get("username") !== "ui-user" ||
            submitted.get("password") !== "ui-password"
          ) {
            response.statusCode = 401;
            response.end("Rejected");
            return;
          }
          loginAttempts += 1;
          response.setHeader(
            "Set-Cookie",
            "ui-session=active; HttpOnly; Path=/; SameSite=Lax",
          );
          response.setHeader("content-type", "text/html");
          response.end('<main id="authenticated">Signed in</main>');
        });
        return;
      }

      if (
        incomingRequest.method === "GET" &&
        requestUrl.pathname === "/private"
      ) {
        const authorized =
          incomingRequest.headers.cookie?.includes("ui-session=active");
        response.statusCode = authorized ? 200 : 401;
        response.setHeader("content-type", "text/html");
        response.end(
          authorized
            ? '<main id="authenticated">Private</main>'
            : "Unauthorized",
        );
        return;
      }

      response.statusCode = 404;
      response.end("Not found");
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string") {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      throw new Error("Could not bind the local UI auth test server.");
    }

    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "auth-ui-"));
    const config = authConfig({
      strategy: "ui",
      sessionDirectory: directory,
      ui: {
        loginPath: "/login",
        validationPath: "/private",
        usernameSelector: "#user",
        passwordSelector: "#pass",
        submitSelector: "#submit",
        authenticatedSelector: "#authenticated",
      },
    });
    const strategy = new UIAuthStrategy(
      config.ui,
      `http://127.0.0.1:${address.port}`,
      3000,
    );
    const manager = new AuthenticationManager(config, { ui: strategy });
    const user: AuthUser = {
      id: "local-ui-user",
      role: "local-ui-role",
      credentials: { username: "ui-user", password: "ui-password" },
    };

    try {
      const firstSession = await manager.getSession(user, browser);
      expect(
        firstSession.storageState.cookies.some(
          (cookie) => cookie.name === "ui-session",
        ),
      ).toBe(true);
      await firstSession.context.close();

      const reusedSession = await manager.getSession(user, browser);
      expect(loginAttempts).toBe(1);
      expect(await strategy.validateSession(user, reusedSession.context)).toBe(
        true,
      );
      await reusedSession.context.close();
    } finally {
      manager.invalidate(user);
      fs.rmSync(directory, { recursive: true, force: true });
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  test("reauthenticates a cached session rejected by the configured strategy", async ({
    browser,
  }) => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "auth-stale-"));
    const config = authConfig({ sessionDirectory: directory });
    let authenticationCount = 0;
    let sessionValid = true;
    const strategy: AuthStrategy = {
      async authenticate(): Promise<AuthStrategyResult> {
        authenticationCount += 1;
        return {};
      },
      async validateSession(): Promise<boolean> {
        return sessionValid;
      },
    };
    const manager = new AuthenticationManager(config, { custom: strategy });
    const user = authUser("editor", "user-editor");

    try {
      const firstSession = await manager.getSession(user, browser);
      await firstSession.context.close();
      sessionValid = false;

      const refreshedSession = await manager.getSession(user, browser);
      expect(authenticationCount).toBe(2);
      await refreshedSession.context.close();
    } finally {
      manager.invalidate(user);
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  test("API auth extracts configured token without logging credentials or token", async () => {
    const token = "private-token-value";
    const username = "private-user-value";
    const password = "private-password-value";
    const server = createServer((incomingRequest, response) => {
      incomingRequest.resume();
      incomingRequest.on("end", () => {
        response.setHeader("content-type", "application/json");
        response.end(JSON.stringify({ result: { credential: token } }));
      });
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string") {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      throw new Error("Could not bind the local auth test server.");
    }

    const messages: string[] = [];
    const originalConsoleLog = console.log;
    console.log = ((...values: unknown[]) => {
      messages.push(values.map(String).join(" "));
    }) as typeof console.log;

    try {
      const strategy = new APIAuthStrategy(
        {
          loginEndpoint: "/login",
          sessionValidationEndpoint: "",
          requestPayload: {
            loginId: "{{username}}",
            passcode: "{{password}}",
          },
          tokenJsonPath: "result.credential",
          tokenHeaderName: "X-Session-Token",
          tokenPrefix: "",
          tokenExpiryJsonPath: "",
        },
        `http://127.0.0.1:${address.port}`,
        2000,
        600,
      );
      const result = await strategy.authenticate(
        {
          id: username,
          role: "operator",
          credentials: { username, password },
        },
        {} as BrowserContext,
      );

      expect(result.headers).toEqual({ "X-Session-Token": token });
      const consoleOutput = messages.join(" ");
      expect(consoleOutput).not.toContain(username);
      expect(consoleOutput).not.toContain(password);
      expect(consoleOutput).not.toContain(token);
    } finally {
      console.log = originalConsoleLog;
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});

function authConfig(
  overrides: Partial<AuthenticationConfig> = {},
): AuthenticationConfig {
  return { ...baseAuthConfig(), ...overrides };
}

function baseAuthConfig(): AuthenticationConfig {
  return {
    ...FrameworkConfig.authentication,
    enabled: true,
    strategy: "custom" as const,
    reuseStorageState: true,
    refreshExpiredSession: true,
    sessionDirectory: "",
    sessionLifetimeSeconds: 3600,
    expirationSkewSeconds: 0,
  };
}

function authUser(role: string, id: string): AuthUser {
  return {
    id,
    role,
    credentials: { username: `${id}-username`, password: `${id}-password` },
  };
}

function validEnvironment(): NodeJS.ProcessEnv {
  return {
    BASE_URL: "https://app.example.test",
    API_URL: "https://api.example.test",
    USERNAME: "placeholder-user",
    PASSWORD: "placeholder-password",
    HEADLESS: "true",
  };
}
