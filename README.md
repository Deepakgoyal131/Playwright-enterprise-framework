# Playwright Enterprise Framework

A TypeScript and Playwright framework for UI and API automation. Environment values come from `configs/env/.env.<environment>` or the process environment; framework behavior and environment execution profiles come from `configs/FrameworkConfig.ts`.

## Environment Configuration

Supported environments are `local`, `dev`, `qa`, `uat`, `staging`, and `production`. The legacy name `prod` is accepted as an alias for `production`, and resolves to `.env.prod`. If `FRAMEWORK_ENV` is omitted, the framework retains the existing default of `qa`.

`Environment` is the single runtime resolver for the selected environment, environment file, base URLs, execution profile, and production policy. Keep environment-specific values in `.env` files; keep framework behavior and per-environment execution overrides in `FrameworkConfig`. Tests and helpers use `Environment.baseURL` and `Environment.apiURL`, so API and UI targets stay separate without hardcoding URLs in tests.

Copy `configs/env/.env.example` to the desired ignored filename, then replace placeholders using approved local secret management:

```powershell
Copy-Item configs/env/.env.example configs/env/.env.local
Copy-Item configs/env/.env.example configs/env/.env.staging
```

The template contains only dummy `.invalid` URLs and placeholder credentials. Required keys are `BASE_URL`, `API_URL`, `USERNAME`, `PASSWORD`, and `HEADLESS`. `.env.dev` and `.env.uat` are currently empty in this checkout; supply their local configuration before using those environments. Environment files are ignored to prevent future commits. If previously tracked environment files contained real credentials, rotate them; ignore rules do not erase secrets from existing Git history.

Switch environment with `FRAMEWORK_ENV` or the cross-platform npm scripts:

```powershell
npm run test:local
npm run test:dev
npm run test:qa
npm run test:uat
npm run test:staging
npm run test:production
```

The equivalent environment-first form works in PowerShell and other shells:

```powershell
$env:FRAMEWORK_ENV = "staging"
npx playwright test
Remove-Item Env:FRAMEWORK_ENV
```

In bash, use `FRAMEWORK_ENV=staging npx playwright test`. `cross-env` is already installed and is used by the npm scripts.

The legacy `npm run test:prod` command is retained and resolves to the same production environment as `npm run test:production`.

### Execution Profiles

`FrameworkConfig.environment.profiles` can override retries, workers, and `fullyParallel` per environment, with optional `ci` overrides. Missing profile overrides fall back to the existing `retry`, `workers`, and `execution` settings. `FrameworkConfig.timeout`, browser, reporter, screenshot, video, trace, and Allure settings remain shared unless explicitly overridden in these framework settings.

### Production Safety

Production execution is blocked by default. To run the production profile, explicitly opt in in the invoking shell:

```powershell
$env:ALLOW_PRODUCTION_TESTS = "true"
npm run test:production
Remove-Item Env:ALLOW_PRODUCTION_TESTS
```

The legacy `npm run test:prod` script also resolves to production and has the same guard. Destructive tests whose titles include `@destructive` are excluded in production by default. To enable them, both set `environment.productionSafety.allowDestructiveTests: true` in `FrameworkConfig` and set `ALLOW_PRODUCTION_DESTRUCTIVE_TESTS=true` in the invoking environment, in addition to the general production opt-in. Prefer not to run destructive tests against production; the guard is an explicit additional barrier, not a substitute for safe test design.

Invalid environment names, missing variables, malformed URLs, invalid profiles, and absent production opt-in fail with actionable messages that identify keys/settings only and do not print their values.

## Run Tests

```powershell
npm run test:qa
npm run test:dev
npm run test:uat
npm run test:staging
```

Playwright runs `GlobalSetup.ts` once before the test run and `GlobalTeardown.ts` after it. The framework's execution metadata reporter writes the final run status. API-only or focused tests can be selected using Playwright's standard arguments, for example:

```powershell
npx playwright test tests/api
npx playwright test tests/globalLifecycle.spec.ts
```

`Environment.initialize()` validates the selected environment and required keys before Playwright starts. See [Environment Configuration](#environment-configuration) for production opt-in and `.env` setup.

## Parallel Execution and Isolation

Playwright owns worker scheduling. `FrameworkConfig.environment.profiles` supplies environment-specific `workers`, retries, and `fullyParallel` values; the nested `ci` profile can override those for CI. CLI options can override the worker count for an individual run:

```powershell
npx playwright test --workers=1
npx playwright test --workers=2
npx playwright test --workers=4
```

With `fullyParallel: false`, Playwright runs files across workers while keeping tests in each file sequential. Enable `fullyParallel` for a profile only after its tests and application data are independent. `test.describe.configure({ mode: "parallel" })` is available for explicitly parallel groups. Use `mode: "serial"` only for an unavoidable dependency; serial groups are less resilient because a failure can skip later tests in that group.

The framework uses Playwright's test-scoped `page` and `context`; its `apiClient` creates and disposes a request context per test. Authenticated tests receive a new browser context per test. Reusable storage state is partitioned under a worker-specific session directory and role/user-specific files, so separate workers do not overwrite the same session cache. Browser cookies/local storage remain isolated in each context. Use separate application accounts when the service invalidates earlier sessions on a new login.

JSON, CSV, and Excel reader methods return defensive copies; tests can mutate returned objects without changing the reader cache or another test's input. Use `testExecutionId` when creating unique application-owned test records or temporary filenames:

```ts
test("creates an isolated record", async ({ testExecutionId }) => {
  const recordName = `parallel-record-${testExecutionId}`;
  // Create only test-owned data and register its cleanup.
});
```

The identifier includes the global run ID, Playwright test ID, and retry number. Framework diagnostics also log environment, worker index, parallel index, test ID, retry, and final status; no test title or credentials are logged. Screenshot filenames include a sanitized label and UUID to avoid collisions. Playwright continues to manage per-test video/trace/attachments in its normal result directories.

### Debugging Parallel Failures

- Re-run the failing test with `--workers=1` to distinguish a race from a deterministic failure; then try `--workers=2` to reproduce worker contention.
- Check that test data uses `testExecutionId` or another unique key and that cleanup removes only records created by that test.
- Check that tests do not mutate a shared reader result or use the same user when server-side sessions are single-session-per-account.
- Use Playwright traces, screenshots, and the worker/test ID diagnostics to correlate failures without logging secrets.
- Keep global test-data initialization disabled unless the configured strategy creates uniquely owned resources and has idempotent cleanup.

## Global Lifecycle Configuration

Global setup options are under `globalLifecycle` in `configs/FrameworkConfig.ts`:

```ts
globalLifecycle: {
  metadataPath: "reports/execution-metadata.json",
  healthCheck: {
    enabled: false,
    base: "api", // "api" or "app"
    endpoint: "", // Set to your application's relative health endpoint, e.g. "/health"
    timeout: 10000,
    expectedStatus: 200,
  },
  testData: {
    strategy: "none", // "none" or "module"
    modulePath: "",
  },
}
```

The health check is disabled by default; no application-specific endpoint is assumed. When enabled, it sends a GET request to the configured relative endpoint using `API_URL` for `base: "api"` or `BASE_URL` for `base: "app"`. The expected status and timeout are configurable.

Environment validation accepts `local`, `dev`, `qa`, `uat`, `staging`, and `production` (`prod` is an alias), checks required values, validates absolute HTTP/HTTPS application URLs, validates the `HEADLESS` boolean, and checks positive timeout/viewport values and non-negative retry counts. Error messages identify invalid keys/settings but never include environment values.

## Optional Test Data

The default strategy is `none`; setup creates and deletes no application data. To opt in, set `strategy: "module"` and configure a module path relative to the repository working directory. The module must export asynchronous `initialize` and `cleanup` functions:

```ts
interface GlobalTestDataStrategyModule {
  initialize(context: {
    environment: string;
    executionId: string;
  }): Promise<Array<{ type: string; id: string }>>;

  cleanup(
    context: { environment: string; executionId: string },
    resources: Array<{ type: string; id: string }>,
  ): Promise<void>;
}
```

`initialize` must return only references to resources created by that setup run. `cleanup` receives only those references and should be idempotent and narrowly scoped to them. Do not return credentials, tokens, or user-owned/application-owned resources. The framework persists the returned resource references in execution metadata so teardown can clean them even though Playwright invokes setup and teardown in separate hook phases. If setup fails after resources were returned, setup attempts rollback immediately; teardown also skips resources already marked cleaned.

If `initialize` fails before it can return its resource list, that strategy module must roll back any partial work itself because the framework has no resource references to pass to `cleanup`.

The framework does not provide authentication or session fixtures as part of global setup.

## Execution Metadata

The default output is `reports/execution-metadata.json`. It records the environment, execution ID, start/end timestamps, configured browser, run status, cleanup status, and explicit setup-created resource references. It does not record credentials, tokens, or application URLs. Override `metadataPath` if the report location should differ.

## Reporting

The existing framework reporter settings remain configured through `FrameworkConfig`. If Allure is enabled, generate/open reports with:

```powershell
npm run allure:generate
npm run allure:open
```

See [Allure configuration](docs/configurationsDocs/allure.md) for attachment and redaction behavior.

## Authentication and Sessions

Authentication is opt-in. The framework core provides `AuthenticationManager`, UI/API strategies, and secure Playwright `storageState` reuse; application roles, login locators, endpoints, payload shape, and authenticated-state checks remain configuration supplied by each application. No authentication or session is created for existing tests unless a test requests the `authSession`, `authenticatedContext`, `authenticatedPage`, or `authenticatedApiClient` fixture.

### Configuration

Configure `authentication` in `configs/FrameworkConfig.ts`:

```ts
authentication: {
  enabled: true,
  strategy: "ui", // "ui", "api", or "custom"
  sessionDirectory: "playwright/.auth",
  reuseStorageState: true,
  refreshExpiredSession: true,
  sessionLifetimeSeconds: 3600,
  expirationSkewSeconds: 60,
  users: {
    viewer: {
      usernameEnv: "AUTH_VIEWER_USERNAME",
      passwordEnv: "AUTH_VIEWER_PASSWORD",
    },
    administrator: {
      usernameEnv: "AUTH_ADMIN_USERNAME",
      passwordEnv: "AUTH_ADMIN_PASSWORD",
    },
  },
  ui: {
    loginPath: "/replace-with-login-path",
    validationPath: "/replace-with-authenticated-page",
    usernameSelector: "replace-with-username-selector",
    passwordSelector: "replace-with-password-selector",
    submitSelector: "replace-with-submit-selector",
    authenticatedSelector: "replace-with-authenticated-state-selector",
  },
  api: {
    loginEndpoint: "/replace-with-login-endpoint",
    sessionValidationEndpoint: "/replace-with-session-validation-endpoint",
    requestPayload: {
      username: "{{username}}",
      password: "{{password}}",
    },
    tokenJsonPath: "replace.with.token.path",
    tokenHeaderName: "Authorization",
    tokenPrefix: "Bearer",
    tokenExpiryJsonPath: "replace.with.expiry.path",
  },
}
```

Keep the strategy that you are not using populated with empty placeholder values. The role names above are examples only: define application-specific roles in your own framework configuration, not in core code. A role maps to environment variable names; the framework resolves those values only when that role is requested. Existing environment initialization still requires `BASE_URL`, `API_URL`, `USERNAME`, `PASSWORD`, and `HEADLESS`. Add role-specific secrets to the selected local/secret-managed environment, for example:

```dotenv
AUTH_VIEWER_USERNAME=replace-locally
AUTH_VIEWER_PASSWORD=replace-locally
AUTH_ADMIN_USERNAME=replace-locally
AUTH_ADMIN_PASSWORD=replace-locally
```

These are placeholder values, not usable credentials. Do not commit real credentials or tokens. API login payloads must use both `{{username}}` and `{{password}}` placeholders; arbitrary payload field names can be used, for example `{ email: "{{username}}", passcode: "{{password}}" }`.

### UI Authentication

The built-in UI strategy uses only configured paths and selectors. `validationPath` is optional; when set, the framework checks `authenticatedSelector` against the loaded session before reuse. Without a validation path, session freshness uses saved TTL and cookie expiration. The login page and success state are application-specific and must be configured:

```ts
import { expect } from "@playwright/test";
import { test } from "@fixtures/BaseTest";

test.describe("Viewer UI", () => {
  test.use({ authRole: "viewer" });

  test("opens the signed-in area", async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.locator("replace-with-app-selector"),
    ).toBeVisible();
  });
});
```

### API Authentication

The built-in API strategy sends a `POST` to `loginEndpoint` using the configured payload, extracts the token at `tokenJsonPath`, and applies the configured header/prefix to authenticated contexts and requests. `tokenExpiryJsonPath` may point to a Unix-seconds, Unix-milliseconds, or ISO date expiry. If omitted or unparseable, `sessionLifetimeSeconds` is used. An optional `sessionValidationEndpoint` checks the cached token before reuse.

```ts
import { expect } from "@playwright/test";
import { test } from "@fixtures/BaseTest";

test.describe("Viewer API", () => {
  test.use({ authRole: "viewer" });

  test("reads an authorized resource", async ({ authenticatedApiClient }) => {
    const response = await authenticatedApiClient.get(
      "/replace-with-authorized-endpoint",
    );
    expect(response.ok()).toBe(true);
  });
});
```

For application-specific flows, implement the exported `AuthStrategy` interface and pass it with `test.use({ authRole: "viewer", authStrategy: customStrategy })` while `authentication.strategy` is `"custom"`. The strategy receives credentials and a `BrowserContext`; it must not log them. API auth requests disable Allure body attachments so non-standard token fields cannot leak into reports.

### Session Reuse and Expiration

Sessions are written as native storage-state JSON plus separate session metadata under `sessionDirectory`. Filenames use a SHA-256 digest of role and user identifier, so different users/roles get distinct files without exposing usernames in filenames. Directory/file permissions are restricted where supported. The configured session lifetime and cookie expiry are checked before reuse; UI/API strategies can additionally validate server-side state. If state is missing, invalid, expired, or rejected, `refreshExpiredSession: true` performs authentication again. Set it to `false` to fail instead. `reuseStorageState: false` disables disk persistence. For custom manager flows, call `AuthenticationManager.invalidate(user)` to remove that user's saved session.

The example spec [tests/auth/authenticatedUsage.example.spec.ts](tests/auth/authenticatedUsage.example.spec.ts) is skipped unless the configured role and (for the API case) endpoint are supplied. Run the application-free framework auth tests with:

```powershell
npx playwright test tests/auth/authentication.spec.ts
```

To run the examples, set `AUTH_EXAMPLE_ROLE` to a configured role and `AUTH_EXAMPLE_API_PATH` to an authorized API path, then run:

```powershell
npx playwright test tests/auth/authenticatedUsage.example.spec.ts
```

### Security Precautions

- `playwright/.auth/`, `*.storageState.json`, and `*.session.json` are ignored by Git. Keep custom session directories protected and out of source control.
- Storage state and session metadata contain reusable secrets (cookies and possibly bearer headers); protect them as credentials and delete them when no longer needed.
- Authentication errors and logs omit credential/token values. API login response/body attachments are disabled; regular API attachments continue to use configured field redaction.
- Avoid screenshots of login forms or pages containing sensitive data. Use a dedicated test account with least privilege and non-production data.
- UI selectors, role names, login endpoints, token paths, and authorized test endpoints are placeholders and must be supplied by the application team.
