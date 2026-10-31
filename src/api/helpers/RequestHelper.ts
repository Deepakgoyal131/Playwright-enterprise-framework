import type { APIResponse } from "@playwright/test";
import { FrameworkConfig } from "../../../configs/FrameworkConfig";
import { ErrorHandler, ErrorType } from "../../core/errors";
import { Logger } from "../../core/logger";
import { AllureHelper } from "../../core/helpers/reporting/AllureHelper";
import type { APIHttpMethod } from "../types/APIClient.types";

interface APIRequestDetails {
  url: string;
  options?: unknown;
}

export class RequestHelper {
  public static async execute(
    method: APIHttpMethod,
    details: APIRequestDetails,
    sendRequest: () => Promise<APIResponse>,
  ): Promise<APIResponse> {
    Logger.debug(`Sending API ${method} request.`);

    try {
      return await AllureHelper.step(
        `${method} ${this.sanitizeUrl(details.url)}`,
        async () => {
          const response = await sendRequest();
          Logger.info(
            `API ${method} request completed with status ${response.status()}.`,
          );
          if (
            AllureHelper.isEnabled() &&
            FrameworkConfig.allure.attachApiDetails
          ) {
            await AllureHelper.attachJson("API Request and Response", {
              schemaVersion: 1,
              request: this.sanitizeRequest(method, details),
              response: await this.sanitizeResponse(response),
            });
          }
          return response;
        },
      );
    } catch (error) {
      if (AllureHelper.isEnabled() && FrameworkConfig.allure.attachApiDetails) {
        await AllureHelper.attachJson("API Request Failure", {
          schemaVersion: 1,
          request: this.sanitizeRequest(method, details),
          error: {
            name: error instanceof Error ? error.name : "Error",
            message: "Request failed before an HTTP response was received.",
          },
        });
      }
      ErrorHandler.handle(
        ErrorType.API,
        "RequestHelper.execute",
        `API ${method} request failed.`,
        error,
      );
    }
  }

  private static sanitizeRequest(
    method: APIHttpMethod,
    details: APIRequestDetails,
  ): Record<string, unknown> {
    const options = (details.options ?? {}) as Record<string, unknown>;
    const body: Record<string, unknown> = {};

    for (const key of ["data", "form", "multipart"]) {
      if (key in options) {
        body[key] = this.sanitizeBody(options[key]);
      }
    }

    return {
      method,
      url: this.sanitizeUrl(details.url),
      headers: this.sanitizeHeaders(options.headers),
      params: this.sanitizeValue(options.params),
      body: Object.keys(body).length > 0 ? body : undefined,
    };
  }

  private static async sanitizeResponse(
    response: APIResponse,
  ): Promise<Record<string, unknown>> {
    const headers = response.headers();
    const contentType = headers["content-type"] ?? "";
    let body: unknown = "[body omitted: response is not JSON]";

    if (contentType.toLowerCase().includes("json")) {
      try {
        const responseBody = await response.body();
        body =
          responseBody.length > 65536
            ? "[body omitted: JSON response exceeds 64 KiB]"
            : this.sanitizeValue(JSON.parse(responseBody.toString("utf8")));
      } catch {
        body = "[body omitted: response JSON could not be parsed]";
      }
    }

    return {
      status: response.status(),
      statusText: response.statusText(),
      headers: this.sanitizeHeaders(headers),
      body,
    };
  }

  private static sanitizeUrl(value: string): string {
    try {
      const isAbsolute = /^[a-z][a-z\d+.-]*:/i.test(value);
      const url = new URL(value, "http://api.local");
      url.username = "";
      url.password = "";

      for (const key of Array.from(url.searchParams.keys())) {
        if (this.isSensitiveField(key)) {
          url.searchParams.set(key, "[REDACTED]");
        }
      }

      return isAbsolute
        ? url.toString()
        : `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return "[URL omitted: invalid URL]";
    }
  }

  private static sanitizeHeaders(value: unknown): Record<string, string> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(value).map(([name, headerValue]) => [
        name,
        this.isSensitiveField(name) ? "[REDACTED]" : String(headerValue),
      ]),
    );
  }

  private static sanitizeBody(value: unknown): unknown {
    if (typeof value !== "string") {
      return this.sanitizeValue(value);
    }

    try {
      return this.sanitizeValue(JSON.parse(value));
    } catch {
      return "[body omitted: unstructured content]";
    }
  }

  private static sanitizeValue(value: unknown, key?: string): unknown {
    if (key && this.isSensitiveField(key)) {
      return "[REDACTED]";
    }
    if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
      return "[binary content omitted]";
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeValue(item));
    }
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([entryKey, entryValue]) => [
          entryKey,
          this.sanitizeValue(entryValue, entryKey),
        ]),
      );
    }
    return value;
  }

  private static isSensitiveField(key: string): boolean {
    const normalizedKey = key.toLowerCase().replace(/[-_]/g, "");
    return (
      FrameworkConfig.allure.redactFields.some(
        (field) => field.toLowerCase().replace(/[-_]/g, "") === normalizedKey,
      ) || /(authorization|cookie|password|token|secret|apikey)/i.test(key)
    );
  }
}
