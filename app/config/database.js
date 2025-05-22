import mysql, { createPool } from 'mysql2/promise';
import { AppConfig } from './appConfig.js';

const config = {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

const pool = {
  max: 10,
  min: 0,
}

const tellerPool = createPool({
  host: AppConfig.DB_HOST,
  port: AppConfig.DB_PORT,
  user: AppConfig.DB_USER,
  password: AppConfig.DB_PASSWORD,
  database: AppConfig.DB_DATABASE,
  ...config,
  pool: pool,
});

const initialConnection = async () => {
  let connection;
  try {
    connection = await tellerPool.getConnection();
    console.log('Connected to the database');
  }
  catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
  finally {
    if (connection) connection.release();
  }

}

export { tellerPool, initialConnection };


