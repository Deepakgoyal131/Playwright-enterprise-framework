# API Assertions

API assertions are separate from `AssertionHelper`, which is reserved for browser `Locator` and `Page` assertions. Import `APIAssertionHelper` from the framework fixture entry point:

```ts
import { APIAssertionHelper, test } from "@fixtures/BaseTest";

test("checks the record response", async ({ apiClient }) => {
  const response = await apiClient.get("/records/1");

  await APIAssertionHelper.assertStatus(response, 200);
  await APIAssertionHelper.assertOK(response);
  await APIAssertionHelper.assertHeader(
    response,
    "content-type",
    "application/json",
  );
  await APIAssertionHelper.assertJsonContains(response, { id: 1 });
});
```

Available methods:

- `assertStatus(response, expectedStatus)` checks one exact status code.
- `assertStatusInRange(response, minimumStatus, maximumStatus)` checks an inclusive status range.
- `assertOK(response)` uses Playwright's `APIResponse.toBeOK()` matcher for a successful status.
- `assertHeader(response, headerName, expectedValue)` checks a response header; header names are case-insensitive.
- `assertJson(response, expectedBody)` compares the parsed JSON body for equality.
- `assertJsonContains(response, expectedProperties)` checks that the parsed JSON includes the expected object properties.

Methods use Playwright `expect` matchers and retain their failure diagnostics. Assertions do not send requests, parse bodies implicitly outside the requested JSON assertions, or convert non-success responses into transport errors.
