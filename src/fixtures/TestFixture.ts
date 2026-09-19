import {
    test as base,
    expect as baseExpect
} from "@playwright/test";

export interface TestFixtures {
    // Framework-level fixtures will be added here.
    // loginPage: LoginPage;
}

export const test = base.extend<TestFixtures>({

        // loginPage: async ({ page },use) => {

        //     const loginPage = new LoginPage(page);
        //     await use(loginPage);
        // }
});

export const expect = baseExpect;