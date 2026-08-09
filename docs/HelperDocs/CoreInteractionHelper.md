**Standard Helper Work Flow**
Public Method
      │
      ▼
Logger.debug(Start)
      │
      ▼
RetryHelper.execute()
      │
      ▼
WaitHelper (if required)
      │
      ▼
Playwright Action
      │
      ▼
Logger.info(Success)
      │
      ▼
ErrorHandler(Failure)


**Core Interaction Helpers**
KeyboardHelper
MouseHelper
AssertionHelper
ScreenshotHelper

**KeyboardHelper Responsibilities**
1. Press Single Key
2. Press Multiple Keys
3. Shortcut Keys
4. Type Slowly
5. Type with Delay
6. Select All
7. Copy
8. Paste
9. Cut
10. Tab Navigation
11. Escape
12. Function Keys

**Public API KeyboardHelper**
await KeyboardHelper.press(page, "Enter");
await KeyboardHelper.press(page, "Escape");
await KeyboardHelper.pressCombination(page, ["Control", "A"]);
await KeyboardHelper.type(page, "Deepak");
await KeyboardHelper.typeSlowly(page, "Deepak", 50);

**Why?**

Instead of:

await KeyboardHelper.press(page, "ArrowDown");

we write:

await KeyboardHelper.press(page, KeyboardKeys.ARROW_DOWN);

The compiler now helps us catch typos.