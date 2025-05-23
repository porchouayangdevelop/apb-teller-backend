import { config } from 'dotenv'

config();

import cors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import scalar from "@scalar/fastify-api-reference";
import fastify from "fastify";
import { initialConnection } from "./config/database.js";
import fastifyWebsocket from '@fastify/websocket';
import util from 'util';
import path from "path";
import { PdfReader } from 'pdfreader';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import EventEmitter from "events";
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import httpRedirect from './middleware/httpsRedirect.js';
import { AppConfig } from './config/appConfig.js';
import { getAllNetworkAddresses, getSwaggerHostConfig } from './utils/networkUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildApp = async (options = {}) => {
  const defaultOptions = {
    disableRequestLogging: true,
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
  };

  const finalOptions = { ...defaultOptions, ...options };

  const app = fastify(finalOptions);

  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1048576 * 10, // 10 MB
    },
  });

  if (process.env.NODE_ENV === "production") {
    app.register(httpRedirect)
  }

  app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  app.register(fastifyWebsocket, {
    options: {
      maxPayload: 1048576,
    }
  });

  app.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
    prefix: '/public/',
  })


  const networkAddresses = getAllNetworkAddresses();
  const httpPort = parseInt(AppConfig.PORT);
  const httpsPort = parseInt(AppConfig.HTTPS_PORT);

  const swaggerOptions = getSwaggerHostConfig({
    useHttps: options.useHttps,
    httpsPort: httpsPort,
    httpPort: httpPort,
    preferredIP: options.swaggerHost || AppConfig.HOST,
  });

  app.register(fastifySwagger, {
    swagger: {
      info: {
        title: "Real Time APB Tellers API",
        description: `API for retrieving Tellers info rate data with JavaScript and Scalar API Reference. ${swaggerOptions.description}`,
        version: "1.0.0",
      },

      host: swaggerOptions.host,
      // schemes: ["http","https"],
      // schemes: process.env.NODE_ENV === 'production' ? ["https", "http"] : ["http"],
      schemes: swaggerOptions.schemes,
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


  app.get(`/api/v1/server-info`, {
    schema: {
      description: "Get server info",
      tags: ["Server"],
      summary: "Get server info",
      response: {
        200: {
          description: "Success",
          type: "object",
          properties: {
            address: {
              type: "object",
              properties: {
                ipv4: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                ipv6: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
              },
            },
            
          }
        }
      }
    }
  }, async (req, reply) => {
    const address = getAllNetworkAddresses();
    const serverInfo = {
      address: address,
      swaggerUrls: {
        http: address.ipv4.map(ip => `http://${ip}:${httpPort}/docs`),
        https: address.ipv4.map(ip => `https://${ip}:${httpsPort}/docs`),
      },
      apiUrls: {
        http: address.ipv4.map(ip => `http://${ip}:${httpPort}/docs`),
        https: address.ipv4.map(ip => `https://${ip}:${httpsPort}/docs`),
      }
    };
    return serverInfo;
  });


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
