import { FrameworkConfiguration } from "./types/FrameworkConfig.types";

/**
 * Centralized framework configuration.
 *
 * NOTE:
 * This file contains framework behaviour,
 * NOT environment-specific values.
 */
export const FrameworkConfig: Readonly<FrameworkConfiguration> = {

    browser: {

        browserName: "chromium",

        viewport: {
            width: 1920,
            height: 1080,
        },

        ignoreHTTPSErrors: true,

        locale: "en-IN",

        timezoneId: "Asia/Kolkata",

    },

    timeout: {

        test: 120000,

        action: 15000,

        navigation: 30000,

        expect: 10000,

    },

    retry: {

        local: 0,

        ci: 2,

    },

    workers: {

        local: "50%",

        ci: "100%",

    },

    reporter: {

        html: true,

        list: true,

        allure: false,

    },

    artifacts: {

        screenshot: "only-on-failure",

        video: "retain-on-failure",

        trace: "on-first-retry",

    },

    screenshot: {

        enabled: true,

        directory: "reports/screenshots",

        fullPage: true,

        captureOnFailure: true,

        captureOnSuccess: false,

        timestamp: true,

    },

    logging: {

        enabled: true,

        level: "info",

        timestamp: true,

        colors: true,

    },

    performance: {

        enabled: true,

        logExecutionTime: true,

        slowActionThreshold: 3000,

    },

    wait: {

        pollingInterval: 200,

        stableElementTimeout: 500,

    },

    framework: {

        strictMode: true,

        continueOnFailure: false,

        captureConsoleLogs: false,

    },

    allure: {

        enabled: false,

        environmentInfo: true,

        attachScreenshots: true,

        attachVideos: true,

    },

    execution: {

        fullyParallel: false,

        forbidOnlyInCI: true,

    },

};