import {test, expect} from '@playwright/test'
import { Logger } from "@core/logger";

test("check logger", async () => {
    Logger.info("Framework started");
Logger.warn("Retrying click");
Logger.error("Login failed");
Logger.debug("Locator resolved");
})