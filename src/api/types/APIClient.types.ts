import type { APIRequestContext } from "@playwright/test";

export type APIGetOptions = Parameters<APIRequestContext["get"]>[1];
export type APIPostOptions = Parameters<APIRequestContext["post"]>[1];
export type APIPutOptions = Parameters<APIRequestContext["put"]>[1];
export type APIPatchOptions = Parameters<APIRequestContext["patch"]>[1];
export type APIDeleteOptions = Parameters<APIRequestContext["delete"]>[1];

export type APIHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
