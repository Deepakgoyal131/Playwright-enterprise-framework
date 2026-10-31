import { APIAssertionHelper, expect, test } from "@fixtures/BaseTest";

const loginUrl = "https://dummyjson.com/auth/login";

test.describe("DummyJSON login API", () => {
  test("authenticates the demo user and returns token fields", async ({
    apiClient,
  }) => {
    const response = await apiClient.post(loginUrl, {
      headers: { "Content-Type": "application/json" },
      data: {
        username: "emilys",
        password: "emilyspass",
        expiresInMins: 30,
      },
    });

    await APIAssertionHelper.assertStatus(response, 200);
    await APIAssertionHelper.assertHeader(
      response,
      "content-type",
      "application/json; charset=utf-8",
    );

    const result = await response.json();
    expect(result).toMatchObject({
      username: "emilys",
      firstName: "Emily",
      lastName: "Johnson",
    });
    expect(result.id).toEqual(expect.any(Number));
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.accessToken.length).toBeGreaterThan(0);
    expect(result.refreshToken).toEqual(expect.any(String));
    expect(result.refreshToken.length).toBeGreaterThan(0);
  });

  test("rejects invalid credentials", async ({ apiClient }) => {
    const response = await apiClient.post(loginUrl, {
      headers: { "Content-Type": "application/json" },
      data: {
        username: "emilys",
        password: "incorrect-password",
      },
    });

    await APIAssertionHelper.assertStatus(response, 400);
    await APIAssertionHelper.assertJsonContains(response, {
      message: "Invalid credentials",
    });
  });
});
