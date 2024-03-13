export const REDIS_CACHE_TTL = 24 * 60 * 60 * 1000;
export const SEQUELIZE = 'SEQUELIZE';
export const DEVELOPMENT = 'development';
export const TEST = 'test';
export const PRODUCTION = 'production';
export const SESSION_PREFIX = 'ses_';
export const GENERATE_LINK_REPOSITORY = 'GENERATE_LINK_REPOSITORY';
export const OTP_REPOSITORY = 'OTP_REPOSITORY';
export const PARTNERS_REPOSITORY = 'PARTNERS_REPOSITORY';
export const PARTNER_USERS_REPOSITORY = 'PARTNER_USERS_REPOSITORY';
export const USER_PRODUCTS_REPOSITORY = 'USER_PRODUCTS_REPOSITORY';
export const USERS_REPOSITORY = 'USERS_REPOSITORY';
export const USER_HEIRS_REPOSITORY = 'USER_HEIRS_REPOSITORY';
export const API_PREFIX = 'api/v1/';
export const OPEN_API_PREFIX = 'open-api/v1/';
export const KAFKA_CONFIG = {
  clientId: 'kafka-example-client',
  broker: 'localhost:9092',
  groupId: 'social-ecommerce-consumer',
  connectionTimeout: 3000,
  authenticationTimeout: 1000,
  reauthenticationThreshold: 10000
};
