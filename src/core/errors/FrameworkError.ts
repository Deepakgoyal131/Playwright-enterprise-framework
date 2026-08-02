import { ErrorType } from "./ErrorType";

export class FrameworkError extends Error {

    constructor(

        public readonly type: ErrorType,

        public readonly method: string,

        message: string,

        public readonly originalError?: unknown

    ) {

        super(message);

        this.name = "FrameworkError";

    }

}