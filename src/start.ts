import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage, resolveErrorPageLocale } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    const locale = resolveErrorPageLocale(request.url);
    return new Response(renderErrorPage(locale), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
}));
