import { createServer } from "node:http";

export async function startApiTestServer(): Promise<{
  baseURL: string;
  close: () => Promise<void>;
}> {
  const server = createServer((request, response) => {
    const bodyChunks: Buffer[] = [];

    request.on("data", (chunk: Buffer | string) => {
      bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    request.on("end", () => {
      const requestBody = Buffer.concat(bodyChunks).toString("utf8");
      const path = new URL(request.url ?? "/", "http://localhost").pathname;

      response.setHeader("content-type", "application/json");
      response.setHeader("x-test-server", "local");

      if (path === "/missing") {
        response.statusCode = 404;
        response.end(JSON.stringify({ error: "not found" }));
        return;
      }

      response.statusCode = request.method === "POST" ? 201 : 200;
      response.end(
        JSON.stringify({
          method: request.method,
          url: request.url,
          body: requestBody ? JSON.parse(requestBody) : null,
          authorization: request.headers.authorization ?? null,
        }),
      );
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    throw new Error("Could not determine the local API test server address.");
  }

  return {
    baseURL: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}
