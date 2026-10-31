# API Testing Foundation Plan

## Goal

Add a first-class API testing layer to the existing Playwright framework so a test author can make requests, reuse environment configuration, get consistent diagnostics, and assert responses without building request setup in every test. Keep the framework's existing top-level folder structure and preserve all current UI-test imports and behavior.

## Current-State Analysis

- `src/api/` exists but contains only `.gitkeep`; there is no API client, request helper, API assertion helper, or API test suite yet.
- `src/fixtures/TestFixture.ts` extends Playwright's `test` and exports the framework `test` and `expect`. `src/fixtures/BaseTest.ts` and `src/fixtures/index.ts` re-export that entry point. Framework tests are documented to import from `@fixtures/BaseTest`.
- `configs/Environment.ts` already exposes `Environment.apiURL`, but `playwright.config.ts` sets the global Playwright `baseURL` to the UI `Environment.baseURL`. API requests must therefore set/use the API base URL explicitly rather than relying on global `use.baseURL`.
- `Environment.initialize()` requires `BASE_URL`, `API_URL`, `USERNAME`, `PASSWORD`, and `HEADLESS`. `.env.dev` and `.env.uat` currently lack these keys; `.env.qa` and `.env.prod` contain them. Values must be supplied by the project owner and must not be copied into source or docs.
- `ErrorType.API`, `ErrorHandler`, `FrameworkError`, `Logger`, and `FrameworkConfig.timeout` provide reusable conventions for transport errors, diagnostics, and defaults.
- `src/core/helpers/assertions/AssertionHelper.ts` is specifically for browser `Locator`/`Page` assertions. API response assertions should have their own API-focused helper rather than widening this UI helper.
- `tests/temp.spec.ts` is a temporary UI/data-driven scaffold, not an API suite. Existing npm scripts run Playwright by environment (`test:qa`, `test:dev`, `test:uat`, `test:prod`).

## Proposed Structure

Add files within existing directories; do not move or rename current files.

```text
src/
  api/
    APIClient.ts
    index.ts
    types/
      APIClient.types.ts
    helpers/
      RequestHelper.ts
    assertions/
      APIAssertionHelper.ts
  fixtures/
    TestFixture.ts              # extend existing fixture and export apiClient
    BaseTest.ts                 # keep current re-export
    index.ts                    # keep current re-export
  core/
    errors/                     # reuse ErrorType.API and ErrorHandler
configs/
  FrameworkConfig.ts            # add an API timeout only if a distinct default is needed
  types/FrameworkConfig.types.ts
  env/                          # complete values for dev/uat through owner-provided config

tests/
  api/
    APIClient.spec.ts
    APIAssertions.spec.ts

docs/
  ApiDocs/
    APIClient.md
    APIFixture.md
    APIAssertions.md
  API_TESTING_FOUNDATION_PLAN.md
```

The `src/api` layout can be kept flatter if the implementation remains small; the public imports should still be collected by `src/api/index.ts`. Do not add a new top-level source or test tree.

## API Design

### APIClient

- Wrap Playwright's `APIRequestContext` and accept an explicit API base URL, initialized from `Environment.apiURL` by the fixture.
- Expose typed `get`, `post`, `put`, `patch`, and `delete` methods that accept Playwright request options, including headers, query parameters, data, form, multipart, and per-request timeout where supported.
- Return the raw Playwright `APIResponse` from every request. Non-2xx responses are valid API outcomes and must remain inspectable for negative tests; do not throw solely because a response is not successful.
- Provide a clear ownership/disposal contract. The fixture owns the per-test request context and disposes it after the test; tests should not have to dispose it manually.
- Convert request/transport exceptions to `FrameworkError` through `ErrorHandler` with `ErrorType.API`, preserving the original error. Keep HTTP status validation in assertions, not transport code.

### API fixture

- Extend the existing framework fixture in `src/fixtures/TestFixture.ts` with a typed `apiClient` fixture. Do not remove or rename any existing Playwright fixture.
- Create an isolated request context per test using `Environment.apiURL`, then dispose it in fixture teardown even if the test fails.
- Avoid using Playwright's configured global `baseURL` for API traffic because that value is currently the UI URL.
- Keep the established `@fixtures/BaseTest` entry point as the one-line test-author import. Export the API client type or API symbols through existing barrels where useful, without requiring tests to import internals.

### Request helpers

- Keep `RequestHelper` focused on shared request execution behavior such as structured logging, API error conversion, and consistent option composition. It should not conceal method-specific Playwright capabilities.
- Pass through caller-provided headers and options predictably. Do not add implicit authentication, global mutable headers, or hidden response parsing.
- Redact authorization headers, cookies, passwords, tokens, and other configured secrets from logs. Avoid logging request/response bodies by default.
- Do not introduce automatic retries for all methods; retrying non-idempotent operations can create duplicate side effects. Any future retry policy must be explicit and method-aware.

### API assertions

- Add a dedicated `APIAssertionHelper`, separate from the existing UI `AssertionHelper`.
- Start with focused assertions for status/status range, success (`toBeOK`), headers, and JSON response bodies. Use Playwright's `expect` matchers and retain its useful mismatch diagnostics.
- Accept `APIResponse` or parsed body explicitly. Do not make assertion methods issue requests or change client behavior.
- Use `ErrorType.ASSERTION` for assertion failures if wrapping is required by the framework convention; preserve the underlying Playwright assertion error.

## Implementation Sequence

1. **Resolve configuration readiness**
   - Get valid, non-secret `BASE_URL`, `API_URL`, `USERNAME`, `PASSWORD`, and `HEADLESS` values from the project owner for dev and UAT, or deliberately change validation rules so only relevant tests require each setting.
   - Confirm whether API authentication is API key, bearer token, basic auth, cookies, or test-specific credentials. Keep credentials externalized and never commit real secrets.
   - Decide whether API timeout should use the existing action timeout or get its own `api` value in `FrameworkConfig` and `FrameworkConfig.types.ts`.

2. **Implement and export API primitives**
   - Define request/client types that reuse Playwright's option and response types.
   - Implement `APIClient` over `APIRequestContext`, add focused request helper behavior, and provide `src/api/index.ts` exports.
   - Verify non-2xx response pass-through, relative URL behavior against `Environment.apiURL`, and transport-error wrapping.

3. **Add API fixture lifecycle**
   - Add `apiClient` to `TestFixtures` and create/dispose its request context per test.
   - Preserve the UI fixture setup and existing `test`/`expect` exports.
   - Smoke-check both API-only tests and mixed UI/API tests through `@fixtures/BaseTest`.

4. **Add API assertions**
   - Implement the separate assertion helper with focused status, header, and JSON checks.
   - Confirm failures retain actionable Playwright diagnostics and do not swallow the original assertion error.

5. **Add tests and usage documentation**
   - Add tests under `tests/api/` using a controlled, non-production target or a deterministic local mock; do not make automated tests mutate prod.
   - Cover successful and unsuccessful HTTP responses, request options, API base URL selection, fixture teardown, assertion failures, and error/log redaction.
   - Document supported methods, fixture import, authentication/header examples with placeholders, response parsing, environment setup, and safe test-target practices in `docs/ApiDocs/`.
   - Update `docs/Framework.main.md` and `docs/configurationsDocs/enviornment.md` with the API entry point and configuration expectations. Add an API-specific npm script only if the existing environment scripts cannot conveniently select API tests.

## Example Consumer Shape

The intended author experience is concise and stays on the framework fixture entry point:

```ts
import { test, expect } from "@fixtures/BaseTest";

 test("creates and reads a record", async ({ apiClient }) => {
  const created = await apiClient.post("/records", {
    data: { name: "sample" },
  });

  await expect(created).toBeOK();
  const record = await created.json();
  expect(record.name).toBe("sample");
});
```

The example is illustrative; final method signatures and response assertions should follow the actual implementation and Playwright version. Tests must use an API test environment and non-sensitive data.

## Acceptance Criteria

- Existing UI tests continue to import `{ test, expect }` from `@fixtures/BaseTest` and behave as before.
- An API test can use `apiClient` from that same import without manually creating or disposing an `APIRequestContext`.
- Requests target `Environment.apiURL`, not the browser `baseURL`, and support standard Playwright request options and HTTP verbs.
- A non-2xx response is returned for assertions; transport failures are distinguished and reported as API framework errors with the original error retained.
- API assertions cover status/success, headers, and JSON values while leaving UI assertions unchanged.
- Request diagnostics do not disclose credentials, tokens, cookies, or request bodies by default.
- Context teardown occurs after passing and failing tests; automated API tests avoid production mutations.
- TypeScript compilation and the focused API suite pass, and API setup/usage is documented in the existing docs tree.

## Risks and Decisions To Close Before Implementation

- **Auth model:** no API authentication contract is defined yet. The initial API client should accept explicit headers/options and avoid silently requesting or caching tokens until the required auth flow is known.
- **Environment completeness:** dev and UAT cannot currently satisfy the environment validator. Supply the correct configuration or make validation selectively required before claiming those environments are runnable.
- **Prod configuration:** the checked-in prod API host appears to be an example/dev-style value; verify it with the owner and do not run write tests against it.
- **Request context semantics:** confirm that per-test isolation is preferred; use an explicitly shared context only when a future authenticated session requirement justifies sharing state.
- **Assertion wrapper tradeoff:** Playwright `expect` already provides rich diagnostics. Wrap only if consistent framework error metadata is a real requirement; never replace the original matcher details.
- **Test target:** choose a deterministic API test target or local mock before implementing end-to-end API specs.
