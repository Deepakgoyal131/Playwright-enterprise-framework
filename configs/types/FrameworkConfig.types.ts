export interface BrowserConfig {
  browserName: "chromium" | "firefox" | "webkit";
  viewport: {
    width: number;
    height: number;
  };
  ignoreHTTPSErrors: boolean;
  locale: string;
  timezoneId: string;
}

export interface TimeoutConfig {
  test: number;
  action: number;
  navigation: number;
  expect: number;
}

export interface RetryConfig {
  local: number;
  ci: number;
}

export interface WorkerConfig {
  local: string | number;
  ci: string | number;
}

export interface ReporterConfig {
  html: boolean;
  allure: boolean;
  list: boolean;
}

export interface ArtifactConfig {
  screenshot: "off" | "on" | "only-on-failure";
  video: "off" | "on" | "retain-on-failure";
  trace: "off" | "on" | "retain-on-failure" | "on-first-retry";
}

export interface ExecutionConfig {
  fullyParallel: boolean;
  forbidOnlyInCI: boolean;
}

export interface ScreenshotConfig {
    enabled: boolean;
    directory: string;
    fullPage: boolean;
    captureOnFailure: boolean;
    captureOnSuccess: boolean;
    timestamp: boolean;
}

export interface LoggingConfig {
    enabled: boolean;
    level: "debug" | "info" | "warn" | "error";
    timestamp: boolean;
    colors: boolean;
}

export interface PerformanceConfig {
    enabled: boolean;
    logExecutionTime: boolean;
    slowActionThreshold: number;
}

export interface WaitConfig {
    pollingInterval: number;
    stableElementTimeout: number;
}

export interface FrameworkBehaviorConfig {
    strictMode: boolean;
    continueOnFailure: boolean;
    captureConsoleLogs: boolean;
}

export interface AllureConfig {
    enabled: boolean;
    environmentInfo: boolean;
    attachScreenshots: boolean;
    attachVideos: boolean;
}

export interface FrameworkConfiguration {

    browser: BrowserConfig;

    timeout: TimeoutConfig;

    retry: RetryConfig;

    workers: WorkerConfig;

    reporter: ReporterConfig;

    artifacts: ArtifactConfig;

    screenshot: ScreenshotConfig;

    logging: LoggingConfig;

    performance: PerformanceConfig;

    wait: WaitConfig;

    framework: FrameworkBehaviorConfig;

    allure: AllureConfig;

    execution: ExecutionConfig;

}