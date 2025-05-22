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

const getServerIPs = () => {
  const networkInterfaces = os.networkInterfaces();
  const ipAddresses = {
    ipv4: [],
    ipv6: []
  };

  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      // Skip internal addresses
      if (!iface.internal) {
        if (iface.family === 'IPv4') {
          ipAddresses.ipv4.push(iface.address);
        } else if (iface.family === 'IPv6' || iface.family === 6) {
          ipAddresses.ipv6.push(iface.address);
        }
      }
    }
  }

  return ipAddresses;
};


const startServer = async () => {
  const serverIPs = getServerIPs();

  const app = await buildApp({logger: {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    }}
  });
  const port = AppConfig.PORT;
  const httpsPort = 443;

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
    app.listen({ port: port, host: AppConfig.HOST, listenTextResolver: () => '' }, (error, address) => {
      if (error) {
        app.log.error(error);
        process.exit(1);
      }
      app.log.info(`HTTP Server running on ${AppConfig.PORT}`);
      if(serverIPs.ipv4.length > 0) {
        app.log.info(`Access via IPv4:`);
        serverIPs.ipv4.forEach(ip=>{
          app.log.info(`http://${ip}:${port}`);
        });
      }

      // if(serverIPs.ipv6.length > 0) {
      //   app.log.info(`Access via IPv6:`);
      //   serverIPs.ipv6.forEach(ip=>{
      //     app.log.info(`http://${ip}:${port}`);
      //   });
      // }

      app.log.info(`Swagger documentation available at: ${address}/docs`);
    });

    // Start HTTPS server if SSL certificates are available
    if (sslOptions) {
      // Create a second Fastify instance for HTTPS
      const httpsServer = https.createServer(sslOptions);
      httpsServer.on('request', (req, reply) => {
        app.server.emit('request', req, reply);
      });

      httpsServer.listen(httpsPort, () => {
        app.log.info(`HTTPS server running on ${httpsPort}`);

        if (serverIPs.ipv4.length > 0) {
          app.log.info('Access via IPv4:');
          serverIPs.ipv4.forEach(ip => {
            app.log.info(`https://${ip}:${httpsPort}`);
          });
        }
        
        // if (serverIPs.ipv6.length > 0) {
        //   app.log.info('Access via IPv6:');
        //   serverIPs.ipv6.forEach(ip => {
        //     app.log.info(`https://[${ip}]:${httpsPort}`);
        //   });
        // }

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

startServer();
