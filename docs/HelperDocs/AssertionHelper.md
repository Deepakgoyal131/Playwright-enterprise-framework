**Assertion Helper**
AssertionHelper Responsibilities

Only:

1. Standard logging
2. Standard timeout
3. Standard error messages
4. Common assertion methods

Nothing else.

**Public API**
await AssertionHelper.assertVisible(locator);

await AssertionHelper.assertHidden(locator);

await AssertionHelper.assertText(locator, "Login");

await AssertionHelper.assertContainsText(locator, "Success");

await AssertionHelper.assertValue(locator, "Deepak");

await AssertionHelper.assertEnabled(locator);

await AssertionHelper.assertDisabled(locator);

await AssertionHelper.assertChecked(locator);

await AssertionHelper.assertUnchecked(locator);

await AssertionHelper.assertUrl(page, "/dashboard");

await AssertionHelper.assertTitle(page, "Dashboard");