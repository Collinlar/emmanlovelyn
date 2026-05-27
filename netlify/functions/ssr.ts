let serverEntry: { fetch: Function };

async function getServerEntry() {
  if (!serverEntry) {
    const module = await import("../../dist/server/index.js");
    serverEntry = module.default;
  }
  return serverEntry;
}

export default async function handler(req: Request) {
  try {
    const handler = await getServerEntry();

    const response = await handler.fetch(req);
    return response;
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
        status: 500,
        unhandled: true,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
