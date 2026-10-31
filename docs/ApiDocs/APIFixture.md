# API Fixture

Import `test` and `expect` from the framework entry point, then request `apiClient` in any test that needs HTTP calls:

```ts
import { APIAssertionHelper, test } from "@fixtures/BaseTest";

test("creates a record", async ({ apiClient }) => {
  const response = await apiClient.post("/records", {
    data: { name: "sample" },
  });

  await APIAssertionHelper.assertStatus(response, 201);
});
```

The fixture creates a new Playwright `APIRequestContext` per test, sets its `baseURL` from `Environment.apiURL`, and disposes it in a `finally` block. No request context cleanup is needed in test code. API and UI tests can use the same framework `test` entry point; UI fixtures remain available and unchanged.

The configured API context uses `FrameworkConfig.timeout.action` as its default timeout. A per-request `timeout` can override that value using Playwright's standard request options.

The current environment validator requires `BASE_URL`, `API_URL`, `USERNAME`, `PASSWORD`, and `HEADLESS` when Playwright starts. Provide valid values in each environment file that you run; the framework repository does not include credentials. Never use write tests against production.
