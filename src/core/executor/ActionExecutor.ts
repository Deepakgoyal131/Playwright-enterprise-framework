import { ActionOptions } from "./ActionOptions";
import { Logger } from "@core/logger";
import { RetryHelper } from "@core/helpers/interaction";
import { Environment } from "configs/Environment";
import { ErrorHandler } from "@core/errors";
import { PerformanceTracker } from "@core/utils/performanceTracker";
import { ActionResult } from "@core/models/ActionResult";

export class ActionExecutor {

    public static async execute<T>(
        options: ActionOptions<T>
    ): Promise<ActionResult<T>> {

        Logger.debug(`Starting ${options.actionName}`);

        const start = PerformanceTracker.start();

        try {

            const retryResult = await RetryHelper.execute({

                actionName: options.actionName,

                retries:
                    options.retries ??
                    Environment.retryCount,

                action: options.action

            });

            const duration =
                PerformanceTracker.stop(start);

            if (options.successMessage) {

                Logger.info(options.successMessage);

            }

            Logger.debug(
                `Duration: ${duration.toFixed(2)} ms | Retries: ${retryResult.attempts - 1}`
            );

            return {

                success: true,

                data: retryResult.result,

                duration,

                retryCount: retryResult.attempts - 1,

                actionName: options.actionName

            };

        }
        catch (error) {

            const duration =
                PerformanceTracker.stop(start);

            ErrorHandler.handle(

                options.errorType,

                options.actionName,

                options.failureMessage,

                error

            );

            return {

                success: false,

                duration,

                retryCount:
                    options.retries ??
                    Environment.retryCount,

                actionName: options.actionName,

                error

            };

        }

    }

}