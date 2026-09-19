**What are Fixtures?**

# Playwright already provides fixtures such as:
1. page
2. browser
3. context
4. request
5. browserName

Our framework will extend Playwright's fixture system with our own application/framework fixtures.

**What is BaseTest?**
BaseTest becomes the standard entry point for all UI tests.

# Instead of:

import { test, expect } from "@playwright/test";

# our framework tests will use:

import {
    test,
    expect
} from "@fixtures/BaseTest";

# This gives us one centralized place to add:

1. common fixtures
2. authentication
3. page objects
4. logging
5. test metadata
6. environment handling
7. common setup
8. common teardown

without modifying every test.