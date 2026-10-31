import { request } from "@playwright/test";
import { APIAssertionHelper, expect, test } from "@fixtures/BaseTest";
import { startApiTestServer } from "./apiTestServer";

test.describe("APIAssertionHelper", () => {
  test("asserts status, headers, success, and JSON response values", async () => {
    const server = await startApiTestServer();
    const requestContext = await request.newContext({
      baseURL: server.baseURL,
    });

    try {
      const response = await requestContext.get("/records");

      await APIAssertionHelper.assertStatus(response, 200);
      await APIAssertionHelper.assertStatusInRange(response, 200, 299);
      await APIAssertionHelper.assertOK(response);
      await APIAssertionHelper.assertHeader(response, "X-Test-Server", "local");
      await APIAssertionHelper.assertJsonContains(response, { method: "GET" });

      const body = await response.json();
      await APIAssertionHelper.assertJson(response, body);
      await expect(
        APIAssertionHelper.assertStatus(response, 201),
      ).rejects.toThrow();
    } finally {
      await requestContext.dispose();
      await server.close();
    }
  });
});
