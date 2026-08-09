import { performance } from "perf_hooks";

export class PerformanceTracker {

    public static start(): number {
        return performance.now();
    }

    public static stop(startTime: number): number {
        return performance.now() - startTime;
    }

}