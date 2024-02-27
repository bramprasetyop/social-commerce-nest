import * as dotenv from 'dotenv';

import { IDatabaseConfig } from './interfaces/dbConfig.interface';

dotenv.config();

export const databaseConfig: IDatabaseConfig = {
  database: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    dialect: process.env.DB_DIALECT as
      | 'postgres'
      | 'mysql'
      | 'sqlite'
      | 'mariadb'
      | 'mssql'
    // start uncomment if using mssql
    // dialectOptions: {
    //   options: {
    //     encrypt: false,
    //   },
    // },
    // define: {
    //   createdAt: false,
    //   updatedAt: false,
    //   deletedAt: false,
    // },
    // end uncomment if using mssql
  }
};
