import { ErrorType } from "../errors";
import { ActionNames } from "@core/enum/ActionsName";

export interface ActionOptions<T = void> {

    actionName: ActionNames;

    errorType: ErrorType;

    retries?: number;

    successMessage?: string;

    failureMessage: string;

    action: () => Promise<T>;

}