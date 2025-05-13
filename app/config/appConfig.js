import { config } from "dotenv";
config({
  path: process.env.NODE_ENV === "development" ? ".env" : ".env.prod"
});

export const AppConfig = {
  PORT: process.env.PORT,
  HOST: process.env.HOST,

  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASS,
  DB_DATABASE: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT,


}