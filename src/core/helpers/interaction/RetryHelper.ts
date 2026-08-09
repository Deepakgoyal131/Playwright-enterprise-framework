// 

import { Logger } from "@core/logger";
import { RetryOptions } from "@core/types/RetryOptions";
import { RetryResult } from "@core/models/RetryResult";

export class RetryHelper {

    public static async execute<T>(
        options: RetryOptions<T>
    ): Promise<RetryResult<T>> {

        let lastError: unknown;

        for (let attempt = 1; attempt <= options.retries + 1; attempt++) {

            try {

                Logger.debug(
                    `[${options.actionName}] Attempt ${attempt}/${options.retries + 1}`
                );

                const result = await options.action();

                if (attempt > 1) {
                    Logger.info(
                        `[${options.actionName}] Succeeded on retry ${attempt}`
                    );
                }

                return {
                    result,
                    attempts: attempt
                };

            } catch (error) {

                lastError = error;

                Logger.warn(
                    `[${options.actionName}] Failed on attempt ${attempt}`
                );

                if (attempt > options.retries) {
                    throw lastError;
                }

            }

        }

        throw lastError;
    }

}