**TestHelper**
This is Used For Test Meta Data.
1. Like Tags : Smoke, E2E, Regression etc
2. And Test Names

# Usage: API
import {
    test,
    expect
} from "@fixtures/BaseTest";

import {
    TestHelper
} from "@core/utils/TestHelper";

import {
    TestTag
} from "@core/types/TestTags";

test(
    TestHelper.testName(
        "Valid Login",
        TestTag.SMOKE,
        TestTag.UI,
        TestTag.CRITICAL
    ),
    async ({ page }) => {

        await page.goto("/login");

        await expect(page).toHaveURL(
            /login/
        );
    }
);

**Runs Specific Tags**
# Smoke
npx playwright test --grep "@smoke"

# Regression
npx playwright test --grep "@regression"

# E2E
npx playwright test --grep "@e2e"

# UI
npx playwright test --grep "@ui"

# Multiple tags
npx playwright test --grep "@smoke|@critical"

