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
