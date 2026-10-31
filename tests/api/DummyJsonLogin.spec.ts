import {
  AllureHelper,
  APIAssertionHelper,
  expect,
  test,
} from "@fixtures/BaseTest";

const loginUrl = "https://dummyjson.com/auth/login";

test.describe("DummyJSON login API", () => {
  test("authenticates the demo user and returns token fields", async ({
    apiClient,
  }) => {
    await AllureHelper.addMetadata({
      severity: "critical",
      epic: "API Testing",
      feature: "Authentication",
      story: "Successful login",
      owner: "QA Team",
    });

    const response = await AllureHelper.step(
      "Submit valid login credentials",
      () =>
        apiClient.post(loginUrl, {
          headers: { "Content-Type": "application/json" },
          data: {
            username: "emilys",
            password: "emilyspass",
            expiresInMins: 30,
          },
        }),
    );

    await AllureHelper.step("Verify successful login response", async () => {
      await AllureHelper.step(
        "Check HTTP status and content type",
        async () => {
          await APIAssertionHelper.assertStatus(response, 200);
          await APIAssertionHelper.assertHeader(
            response,
            "content-type",
            "application/json; charset=utf-8",
          );
        },
      );

      await AllureHelper.step(
        "Check user identity and token fields",
        async () => {
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
        },
      );
    });
  });

  test("rejects invalid credentials", async ({ apiClient }) => {
    await AllureHelper.addMetadata({
      severity: "normal",
      epic: "API Testing",
      feature: "Authentication",
      story: "Invalid login is rejected",
      owner: "QA Team",
    });

    const response = await apiClient.post(loginUrl, {
      headers: { "Content-Type": "application/json" },
      data: {
        username: "emilys",
        password: "incorrect-password",
      },
    });

    await AllureHelper.step(
      "Verify invalid credentials are rejected",
      async () => {
        await APIAssertionHelper.assertStatus(response, 400);
        await APIAssertionHelper.assertJsonContains(response, {
          message: "Invalid credentials",
        });
      },
    );
  });
});
