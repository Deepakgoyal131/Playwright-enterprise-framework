
**BasePage**

Test

↓

LoginPage

↓

BasePage

↓

Helpers

↓

Playwright

**Responsibilities**

Our BasePage should only:

1. Hold the Playwright Page
2. Provide reusable wrapper methods
3. Navigation methods
4. Common page utilities
5. Nothing else

**Why abstract?**
Because nobody should do this:

 - new BasePage(page);

Only:

 - new LoginPage(page);