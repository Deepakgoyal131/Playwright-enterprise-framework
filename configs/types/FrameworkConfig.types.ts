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

export interface FrameworkConfiguration {
  browser: BrowserConfig;
  timeout: TimeoutConfig;
  retry: RetryConfig;
  workers: WorkerConfig;
  reporter: ReporterConfig;
  artifact: ArtifactConfig;
  execution: ExecutionConfig;
}