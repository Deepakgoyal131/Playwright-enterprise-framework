import { ActionOptions } from "./ActionOptions";
import { Logger } from "@core/logger";
import { RetryHelper } from "@core/helpers/interaction";
import { Environment } from "configs/Environment";
import { ErrorHandler } from "@core/errors";

export class ActionExecutor {

    public static async execute<T>(
        options: ActionOptions<T>
    ): Promise<T> {

        Logger.debug(`Starting ${options.actionName}`);

        try {

            const result = await RetryHelper.execute({

                actionName: options.actionName,

                retries:
                    options.retries ??
                    Environment.retryCount,

                action: options.action

            });

            if (options.successMessage) {

                Logger.info(options.successMessage);

            }

            return result;

        }
        catch (error) {

            ErrorHandler.handle(

                options.errorType,

                options.actionName,

                options.failureMessage,

                error

            );

        }

    }

}