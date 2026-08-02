Test
 │
 ▼
WaitHelper
 │
 ├── Wait Visible
 ├── Wait Hidden
 ├── Wait Attached
 ├── Wait Detached
 ├── Wait Enabled
 ├── Wait Disabled
 ├── Wait URL
 ├── Wait Network Idle
 └── Wait Custom Condition

 **Responsibilities of WaitHelper**

It should:

Centralize all waits
Log every wait
Throw meaningful errors
Support custom timeout
Never expose Playwright directly to test cases

**Public API**
WaitHelper.waitForVisible(locator);

WaitHelper.waitForHidden(locator);

WaitHelper.waitForEnabled(locator);

WaitHelper.waitForURL(page, url);

WaitHelper.waitForLoad(page);

WaitHelper.waitForText(locator, text);