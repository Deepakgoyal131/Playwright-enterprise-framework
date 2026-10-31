# API Client

`APIClient` wraps Playwright's `APIRequestContext` and is exposed by the framework fixture. It supports `get`, `post`, `put`, `patch`, and `delete` with Playwright request options, including headers, query parameters, request bodies, and timeouts.

```ts
import { test, expect } from "@fixtures/BaseTest";

test("reads a record", async ({ apiClient }) => {
  const response = await apiClient.get("/records", {
    params: { page: 1 },
    headers: { Accept: "application/json" },
  });

  await expect(response).toBeOK();
  const records = await response.json();
  expect(records).toBeTruthy();
});
```

The fixture configures the request context with `Environment.apiURL`; relative paths therefore resolve against the API host, not the browser `BASE_URL`. The context is isolated per test and disposed automatically after the test, including when a test fails.

The client returns Playwright's raw `APIResponse` for all HTTP statuses. A `4xx` or `5xx` response is not a transport exception and can be inspected with status, headers, and body assertions. Network and request transport failures are raised as `FrameworkError` values with `ErrorType.API` and the original error preserved.

Authentication is explicit. Pass test-specific headers or other supported request options; the foundation does not acquire tokens or store credentials automatically:

```ts
const response = await apiClient.get("/profile", {
  headers: {
    Authorization: `Bearer ${process.env.API_ACCESS_TOKEN}`,
  },
});
```

Do not commit credentials or tokens. The framework logs the HTTP method and response status, but not request URLs, headers, or bodies. Avoid adding secrets to test names or assertion messages as well.

Run the API suite against the configured QA environment with `npx playwright test tests/api`. The API foundation tests use an in-process local HTTP server; use only non-production targets and non-sensitive data for additional API tests.
