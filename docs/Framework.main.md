**FrameWork Progress**
Configuration Layer ✅
Logging Layer ✅
Errorhandler Layer ✅
Base Framework Layer ⏳
Helper Layer ⏳
POM Layer ⏳

## API Testing

API tests use the framework fixture entry point (`@fixtures/BaseTest`) and request the per-test `apiClient` fixture. See [API Client](ApiDocs/APIClient.md), [API Fixture](ApiDocs/APIFixture.md), [API Assertions](ApiDocs/APIAssertions.md), and the [DummyJSON login example](ApiDocs/DummyJsonLoginExample.md).

## Allure Reports

Allure reporting is enabled through `FrameworkConfig`; run a test command such as `npm run test:qa`, then generate and open the report with `npm run allure:generate` and `npm run allure:open`. See [Allure configuration and usage](configurationsDocs/allure.md).
