**ScreenSHOT Helper**
Our ScreenshotHelper should support:

1. Screenshot
2. Failure Screenshot
3. Element Screenshot
4. Full Page Screenshot
5. Timestamp Naming
6. Module-wise Storage
7. Future Allure Attachment

**Public API**
await ScreenshotHelper.capture(page);

await ScreenshotHelper.capture(page, "Login Page");

await ScreenshotHelper.captureElement(locator);

await ScreenshotHelper.captureFullPage(page);

await ScreenshotHelper.captureOnFailure(page);

**FLOW**
Click Failed

↓

ScreenshotHelper.captureOnFailure()

↓

Logger

↓

Throw Error