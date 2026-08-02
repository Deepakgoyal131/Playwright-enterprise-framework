export interface RetryOptions<T = void> {
    actionName: string;
    retries: number;
    action: () => Promise<T>;
}