import { config } from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";

config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import buildApp from "./app/app.js";
import { AppConfig } from "./app/config/appConfig.js";

const startServer = async () => {
  const app = await buildApp();
  const port = AppConfig.PORT;

  const shutdownAPP = async (signal) => {
    app.log.info(`Received ${signal} signal. Closing server...`);
    try {
      await app.close();
      app.log.info("Server closed successfully");
      process.exit(0);
    } catch (error) {
      app.log.error(error);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdownAPP("SIGTERM"));
  process.on("SIGINT", () => shutdownAPP("SIGINT"));

  try {
    app.listen({ port: port, host: AppConfig.HOST }, (error, address) => {
      if (error) {
        app.log.error(error);
        process.exit(1);
      }
      app.log.info(`Server running on port ${address}`);
      app.log.info(`Swagger documentation available at: ${address}/docs`);
      // app.log.info(
      //   `Scalar API Reference available at: http://${AppConfig.HOST}:${AppConfig.PORT}/reference`
      // );
    });

  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

startServer();
