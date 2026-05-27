import type { IncomingMessage, ServerResponse } from "http";

let serverEntry: { fetch: Function };

async function getServerEntry() {
  if (!serverEntry) {
    const module = await import("../dist/server/index.js");
    serverEntry = module.default;
  }
  return serverEntry;
}

export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse
) {
  try {
    const handler = await getServerEntry();

    const url = new URL(
      req.url || "/",
      `http://${req.headers.host || "localhost"}`
    );
    const response = await handler.fetch(
      new Request(url, {
        method: req.method,
        headers: req.headers as HeadersInit,
        body:
          req.method !== "GET" && req.method !== "HEAD"
            ? JSON.stringify(req.body)
            : undefined,
      })
    );

    res.statusCode = response.status;
    response.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });

    const body = await response.text();
    res.end(body);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        message: "Internal Server Error",
        status: 500,
        unhandled: true,
      })
    );
  }
}
