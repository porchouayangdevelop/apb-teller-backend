import cors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import scalar from "@scalar/fastify-api-reference";
import fastify from "fastify";
import { initialConnection } from "./config/database.js";
import fastifyWebsocket from  '@fastify/websocket';
const buildApp = async () => {
  const app = fastify({
    logger: {
      level: "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
      serializers: {
        req(request) {
          return {
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
        },
        res(reply) {
          return {
            statusCode: reply.statusCode,
            headers:
              typeof reply.getHeaders === "function" ? reply.getHeaders() : {},
          };
        },
      },
    },
  });

  app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  app.register(fastifyWebsocket,{
    options:{
      maxPayload: 1048576,    
    }
  });


  const addr =
    process.env.NODE_ENV === "production"
      ? "10.151.146.155:40756"
      : "10.2.6.142:5000";

  app.register(fastifySwagger, {
    swagger: {
      info: {
        title: "Real Time APB Tellers API",
        description: "API for retrieving Tellers info rate data with JavaScript and Scalar API Reference",
        version: "1.0.0",
      },
      
      host: addr,
      schemes: ["http","https"],
      consumes: ["application/json"],
      produces: ["application/json"],
    },
  });

  app.register(scalar, {
    routePrefix: "/docs",
    configuration: {
      title: "Fastify API Service Documentation",
      theme: "bluePlanet",
    },
  });
  await app.register(initialConnection);

  await app.register(import("./routes/index.js"), { prefix: "/api/v1" });

  app.setErrorHandler((error, request, reply) => {
    reply.status(error.statusCode || 500).send({
      statusCode: error.statusCode || 500,
      error: error.name || "Internal Server Error",
      message: error.message || "Something went wrong",
    });
  });

  app.setNotFoundHandler((req, reply) => {
    reply.status(404).send({
      statusCode: 404,
      error: "Not Found",
      message: "The requested resource could not be found",
    });
  });

  return app;
};

export default buildApp;
