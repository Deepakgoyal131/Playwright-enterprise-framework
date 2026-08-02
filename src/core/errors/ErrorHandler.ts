import { Logger } from "../logger";
import { FrameworkError } from "./FrameworkError";
import { ErrorType } from "./ErrorType";

export class ErrorHandler {

    public static handle(

        type: ErrorType,

        method: string,

        message: string,

        error: unknown

    ): never {

        Logger.error(

            `[${type}] ${method} : ${message}`

        );

        throw new FrameworkError(

            type,

            method,

            message,

            error

        );

    }

}