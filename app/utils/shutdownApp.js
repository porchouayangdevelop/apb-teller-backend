
export const shutdownApp = async (fastify, signal) => {
  fastify.log.info(`Received ${signal}, shutting down...`);
  try {
    await fastify.close();
    fastify.log.info("Server closed successfully");
    process.exit(0);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}