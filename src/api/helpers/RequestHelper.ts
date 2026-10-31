import type { APIResponse } from "@playwright/test";
import { ErrorHandler, ErrorType } from "../../core/errors";
import { Logger } from "../../core/logger";
import type { APIHttpMethod } from "../types/APIClient.types";

export class RequestHelper {
  public static async execute(
    method: APIHttpMethod,
    sendRequest: () => Promise<APIResponse>,
  ): Promise<APIResponse> {
    Logger.debug(`Sending API ${method} request.`);

    try {
      const response = await sendRequest();
      Logger.info(
        `API ${method} request completed with status ${response.status()}.`,
      );
      return response;
    } catch (error) {
      ErrorHandler.handle(
        ErrorType.API,
        "RequestHelper.execute",
        `API ${method} request failed.`,
        error,
      );
    }
  }
}
