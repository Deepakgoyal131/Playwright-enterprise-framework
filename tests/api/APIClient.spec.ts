import { request } from "@playwright/test";
import { APIClient, expect, test } from "@fixtures/BaseTest";
import { ErrorType, FrameworkError } from "@core/errors";
import { startApiTestServer } from "./apiTestServer";

test.describe("APIClient", () => {
  test("is available from the framework test fixture", async ({
    apiClient,
  }) => {
    expect(apiClient).toBeInstanceOf(APIClient);
  });

  test("supports HTTP methods and returns non-success responses for assertions", async () => {
    const server = await startApiTestServer();
    const requestContext = await request.newContext({
      baseURL: server.baseURL,
    });
    const apiClient = new APIClient(requestContext);

    try {
      const created = await apiClient.post("/records?source=framework", {
        data: { name: "sample" },
        headers: { Authorization: "Bearer test-token" },
      });

      expect(created.status()).toBe(201);
      expect(await created.json()).toMatchObject({
        method: "POST",
        url: "/records?source=framework",
        body: { name: "sample" },
        authorization: "Bearer test-token",
      });

      const get = await apiClient.get("/records", { params: { page: 2 } });
      const put = await apiClient.put("/records/1", {
        data: { name: "updated" },
      });
      const patch = await apiClient.patch("/records/1", {
        data: { active: true },
      });
      const deleted = await apiClient.delete("/records/1");

      expect((await get.json()).method).toBe("GET");
      expect((await put.json()).method).toBe("PUT");
      expect((await patch.json()).method).toBe("PATCH");
      expect((await deleted.json()).method).toBe("DELETE");

      const missing = await apiClient.get("/missing");
      expect(missing.status()).toBe(404);
      expect(await missing.json()).toEqual({ error: "not found" });
    } finally {
      await requestContext.dispose();
      await server.close();
    }
  });

  test("wraps transport errors with API framework metadata", async () => {
    const requestContext = await request.newContext();
    await requestContext.dispose();
    const apiClient = new APIClient(requestContext);

    await expect(
      apiClient.get("http://127.0.0.1:1/unreachable"),
    ).rejects.toMatchObject({
      name: "FrameworkError",
      type: ErrorType.API,
      method: "RequestHelper.execute",
    } satisfies Partial<FrameworkError>);
  });
});
