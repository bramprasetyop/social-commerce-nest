/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');
dotenv.config();

const databaseConfig = {
  database: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT
  }
};

module.exports = databaseConfig;
