# Playwright Enterprise Framework

A TypeScript and Playwright framework for UI and API automation. The framework loads environment-specific values from `configs/env/.env.<environment>` and framework behavior from `configs/FrameworkConfig.ts`.

## Run Tests

```powershell
npm run test:qa
npm run test:dev
npm run test:uat
npm run test:prod
```

Playwright runs `GlobalSetup.ts` once before the test run and `GlobalTeardown.ts` after it. The framework's execution metadata reporter writes the final run status. API-only or focused tests can be selected using Playwright's standard arguments, for example:

```powershell
npx playwright test tests/api
npx playwright test tests/globalLifecycle.spec.ts
```

The current `Environment.initialize()` requires `BASE_URL`, `API_URL`, `USERNAME`, `PASSWORD`, and `HEADLESS`. Supply real environment values through your approved local secret management process. Do not commit credentials. The checked-in `.env.dev` and `.env.uat` files are incomplete and require owner-provided values before those commands can run.

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

Environment validation accepts `dev`, `qa`, `uat`, or `prod`, checks required values, validates absolute HTTP/HTTPS application URLs, validates the `HEADLESS` boolean, and checks positive timeout/viewport values and non-negative retry counts. Error messages identify invalid keys/settings but never include environment values.

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
