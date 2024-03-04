import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { EliOpenAPIHealthIndicator } from './connection.EliOpenAPI.service';
import { RedisHealthIndicator } from './connection.redis.service';
import { SequelizeHealthIndicator } from './connection.sequelize.service';
import { SftpHealthIndicator } from './connection.sftp.service';

@Controller('/health-check')
export class ConnectionController {
  constructor(
    private readonly connection: HealthCheckService,
    private readonly sequelizeHealthIndicator: SequelizeHealthIndicator,
    private readonly redisHealthIndicator: RedisHealthIndicator,
    private readonly eliOpenAPI: EliOpenAPIHealthIndicator,
    private sftpHealthIndicator: SftpHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.connection.check([
      () => this.sequelizeHealthIndicator.isHealthy(),
      () => this.redisHealthIndicator.isHealthy(),
      async () => this.sftpHealthIndicator.isHealthy(),
      async () => await this.eliOpenAPI.isHealthy(process.env.OPEN_API_URL)
    ]);
  }
}
