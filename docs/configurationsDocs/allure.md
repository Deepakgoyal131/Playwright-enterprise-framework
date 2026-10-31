# Allure Reporting

## Configuration

Allure settings are centralized in `configs/FrameworkConfig.ts`.

- `reporter.allure` and `allure.enabled` must both be `true` for runtime steps, labels, and custom attachments.
- `allure.resultsDir` selects the raw result directory (`allure-results` by default).
- `allure.environmentInfo` adds the selected framework environment, Node.js version, and platform to the report. Credentials and endpoint URLs are not included.
- `allure.attachScreenshots` controls custom screenshot attachments on failed page-based tests. Capture also requires `screenshot.enabled` and `screenshot.captureOnFailure`.
- `allure.attachVideos` controls whether the Playwright video setting from `artifacts.video` is enabled.
- `allure.attachApiDetails` attaches sanitized API request and response data to API request steps.
- `allure.redactFields` names sensitive field keys to redact from API attachments. Authorization, cookie, password, token, secret, and API-key-like names are also redacted automatically. Unstructured request bodies and non-JSON response bodies are omitted; JSON bodies larger than 64 KiB are omitted.

API attachments may include non-sensitive JSON response data. Review this before using the report with production data, and extend `redactFields` for application-specific sensitive names.

## Steps and Metadata

Use `AllureHelper` from the framework fixture entry point. The wrapper skips runtime calls when Allure is disabled, so the test body remains executable without a reporter.

```ts
import { AllureHelper, test } from "@fixtures/BaseTest";

test("example", async () => {
  await AllureHelper.addMetadata({
    severity: "critical",
    epic: "Customer Management",
    feature: "Customer API",
    story: "Create a customer",
    owner: "QA Team",
  });

  await AllureHelper.step("Create customer", async () => {
    await AllureHelper.step("Verify response", async () => {
      // Execute request and assertions here.
    });
  });
});
```

Supported severity values are `blocker`, `critical`, `normal`, `minor`, and `trivial`. The nested calls create Allure sub-steps. API client calls also create a step containing the HTTP method and a sanitized URL. Credentials in query values are redacted.

The [DummyJSON login example](../ApiDocs/DummyJsonLoginExample.md) demonstrates metadata and nested steps in an API test.

## Generate and Open Reports

The existing environment-specific test scripts now produce Allure results along with the configured list and HTML reporters:

```powershell
npm run test:qa
npm run allure:generate
npm run allure:open
```

To serve a report directly from raw results without saving a generated report:

```powershell
npm run allure:serve
```

Raw results are written to the configured `allure.resultsDir` (default `allure-results/`); the generated static report is written to `allure-report/`. Both generated directories are ignored by Git while their checked-in `.gitkeep` placeholders are preserved. `allure:generate` uses `--clean` to replace the previous generated report.
