export interface IDatabaseConfigAttributes {
  username?: string;
  password?: string;
  database?: string;
  host?: string;
  port?: number;
  dialect?: 'mysql' | 'sqlite' | 'postgres' | 'mariadb' | 'mssql';
  // start uncomment if using mssql
  // dialectOptions?: object;
  // define?: object;
  // end uncomment if using mssql
  urlDatabase?: string;
}

export interface IDatabaseConfig {
  database: IDatabaseConfigAttributes;
}
