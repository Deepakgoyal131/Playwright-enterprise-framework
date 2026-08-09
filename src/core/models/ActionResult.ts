export interface ActionResult<T = void> {

    success: boolean;

    data?: T;

    duration: number;

    retryCount: number;

    actionName: string;

    error?: unknown;

}