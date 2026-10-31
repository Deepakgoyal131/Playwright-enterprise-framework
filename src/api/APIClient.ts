import type { APIRequestContext, APIResponse } from "@playwright/test";
import { RequestHelper } from "./helpers/RequestHelper";
import type {
  APIDeleteOptions,
  APIGetOptions,
  APIPatchOptions,
  APIPostOptions,
  APIPutOptions,
} from "./types/APIClient.types";

export class APIClient {
  public constructor(private readonly requestContext: APIRequestContext) {}

  public get(url: string, options?: APIGetOptions): Promise<APIResponse> {
    return RequestHelper.execute("GET", () =>
      this.requestContext.get(url, options),
    );
  }

  public post(url: string, options?: APIPostOptions): Promise<APIResponse> {
    return RequestHelper.execute("POST", () =>
      this.requestContext.post(url, options),
    );
  }

  public put(url: string, options?: APIPutOptions): Promise<APIResponse> {
    return RequestHelper.execute("PUT", () =>
      this.requestContext.put(url, options),
    );
  }

  public patch(url: string, options?: APIPatchOptions): Promise<APIResponse> {
    return RequestHelper.execute("PATCH", () =>
      this.requestContext.patch(url, options),
    );
  }

  public delete(url: string, options?: APIDeleteOptions): Promise<APIResponse> {
    return RequestHelper.execute("DELETE", () =>
      this.requestContext.delete(url, options),
    );
  }
}
