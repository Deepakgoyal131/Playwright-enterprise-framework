# DummyJSON Login Example

The example spec at `tests/api/DummyJsonLogin.spec.ts` shows the framework pattern for a real HTTP API:

1. Import `test` and `expect` from `@fixtures/BaseTest` and request the `apiClient` fixture.
2. Send a `POST` request with a JSON body and `Content-Type` header.
3. Assert the HTTP status and response headers.
4. Parse the JSON response and assert stable user fields and token presence without logging or comparing token values.
5. Test a rejected-credentials response separately; a `400` response is an HTTP result, not a transport failure.

The test uses DummyJSON's documented demo credentials (`emilys` / `emilyspass`). They are public sample credentials, not suitable for any real account. For an application under test, load credentials from an approved secret store or environment variables rather than committing them to the spec.

The request uses an absolute URL because the fixture's default base URL is the framework's configured `API_URL`. The API client accepts absolute URLs, which is useful when an example needs to target a separate service.

The JavaScript `fetch` option `credentials: "include"` is not a request option for Playwright's `APIRequestContext`. A Playwright request context manages its own cookie jar: it stores response cookies and sends applicable cookies on later requests from that same context. The framework fixture creates a context per test, so cookies are isolated to that test. This login endpoint returns access and refresh tokens in the JSON body; the example verifies their presence but never prints their values.

Run only this example with:

```powershell
npx playwright test tests/api/DummyJsonLogin.spec.ts
```

The test depends on the external DummyJSON demo service and therefore requires network access. The rest of `tests/api` includes local-server tests that do not depend on that service.
