import { config } from "dotenv";
config({
  path: process.env.NODE_ENV === "production" ? ".env" :
    process.env.NODE_ENV === 'development' ? ".env" : undefined
});

import { getPrimaryIP, getOptimalHost } from "../utils/networkUtils.js";

export const AppConfig = {
  PORT: process.env.PORT,
  // HOST: process.env.HOST === '0.0.0.0' ? getPrimaryIP() : (process.env.HOST || getPrimaryIP()),
  HOST: process.env.USE_DOCKER_HOST === 'true' ? getOptimalHost() : (getPrimaryIP()),
  HTTPS_PORT: process.env.HTTPS_PORT,

  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASS,
  DB_DATABASE: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT,

}