export default async function (fastify, opts) {
  fastify.get("/health", async function (request, reply) {
    return {
      status: "online",
      version: "1.0.0",
      documentation: "/docs",
      apiReference: "/api-reference",
      method: request.method,
      url: request.url,
      path: request.routerPath,
      parameters: request.params,
      headers: request.headers,
      body: request.body,
      hostname: request.hostname,
      remoteAddress: request.ip,
      remotePort: request.socket ? request.socket.remotePort : undefined,
    };
  });
  fastify.register(import("./teller.routes.js"), {
    prefix: "/tellers",
  });
  fastify.register(import("./upload.routes.js"), {
    prefix: "/uploads",
  });
}
