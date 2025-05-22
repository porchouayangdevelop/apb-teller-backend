import { config } from "dotenv";
config();

import { dirname } from "path";
import { fileURLToPath } from "url";
import https from 'https';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import buildApp from "./app/app.js";
import { AppConfig } from "./app/config/appConfig.js";
import { loadSSLCertificates } from "./app/config/sslConfig.js";
import { getServerIPs } from "./app/utils/networkUtils.js";
// import { shutdownApp } from "./app/utils/shutdownApp.js";

const startServer = async () => {
  const serverIPs = getServerIPs();

  const app = await buildApp({
    logger: {
      level: "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      }
    }
  });
  const port = parseInt(AppConfig.PORT);
  const httpsPort = parseInt(AppConfig.HTTPS_PORT);
  const host = AppConfig.HOST;

  app.log.info(`Starting server with HOST : ${host}, PORT: ${port}, HTTPS_PORT: ${httpsPort}`);

  const sslOptions = loadSSLCertificates();

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
    // Start HTTP server
    app.listen({
      port: port,
      host: host,
      listenTextResolver: () => ``
    });

    app.log.info(`HTTP Server running on ${port}`);
    if (serverIPs.ipv4.length > 0) {
      app.log.info(`HTTP Access via IPv4:`);
      serverIPs.ipv4.forEach(ip => {
        app.log.info(`http://${ip}:${port}`);
      });
    }


    app.log.info(`Swagger documentation available at: http://${host}:${port}/docs`);

    // Start HTTPS server if SSL certificates are available
    if (sslOptions) {
      // Create a second Fastify instance for HTTPS
      const httpsServer = https.createServer(sslOptions);
      httpsServer.on('request', (req, reply) => {
        app.server.emit('request', req, reply);
      });

      await new Promise((_, reject) => {
        httpsServer.listen(httpsPort, (err) => {
          if (err) reject(err);
          _();
        });

        app.log.info(`HTTPS server running on ${httpsPort}`);
        if (serverIPs.ipv4.length > 0) {
          app.log.info('HTTPS Access via IPv4:');
          serverIPs.ipv4.forEach(ip => {
            app.log.info(`https://${ip}:${httpsPort}`);
          });
        }
        app.log.info(`Swagger documentation available at: https://${host}:${httpsPort}/docs`);
        app.log.info("Note: Since you're using self-signed certificates, you may need to accept the security warning in your browser.")
      });

    } else {
      app.log.warn("SSL certificates not found. HTTPS server not started.");
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

startServer().catch(console.error);
