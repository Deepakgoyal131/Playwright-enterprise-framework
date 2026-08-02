**RetryHelper**

**Our Design**

Retry should become a service.

ClickHelper
        │
        ▼
RetryHelper
        │
        ▼
Click Action

The same service can be reused everywhere.

**What Should RetryHelper Do?**

Its responsibility is only to execute an action multiple times if it fails.
It should not know anything about:

1. Click
2. Fill
3. Dropdown
4. Upload

This follows the Single Responsibility Principle.

**Public API**
await RetryHelper.execute({
    actionName: "Click Login Button",
    retries: 2,
    action: async ()=>{
        await page.locator.click();
        await page.locator.fill("Text");

    }
});