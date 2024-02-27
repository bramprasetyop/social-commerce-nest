import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { ExternalAPIHealthIndicator } from './connection.externalAPI.service';
import { RedisHealthIndicator } from './connection.redis.service';
import { SequelizeHealthIndicator } from './connection.sequelize.service';
import { SftpHealthIndicator } from './connection.sftp.service';

@Controller('/health-check')
export class ConnectionController {
  constructor(
    private readonly connection: HealthCheckService,
    private readonly sequelizeHealthIndicator: SequelizeHealthIndicator,
    private readonly redisHealthIndicator: RedisHealthIndicator,
    private readonly externalApiIndicator: ExternalAPIHealthIndicator,
    private sftpHealthIndicator: SftpHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.connection.check([
      () => this.sequelizeHealthIndicator.isHealthy(),
      () => this.redisHealthIndicator.isHealthy(),
      async () => this.sftpHealthIndicator.isHealthy(),
      async () =>
        await this.externalApiIndicator.isHealthy('https://google.co.id')
    ]);
  }
}
