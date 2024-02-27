import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DatabaseModule } from '@src/core/database/database.module';

import { ConnectionController } from './connection.controller';
import { ExternalAPIHealthIndicator } from './connection.externalAPI.service';
import { connectionCheckProviders } from './connection.providers';
import { RedisHealthIndicator } from './connection.redis.service';
import { SequelizeHealthIndicator } from './connection.sequelize.service';
import { SftpHealthIndicator } from './connection.sftp.service';

@Module({
  imports: [TerminusModule, DatabaseModule, HttpModule],
  controllers: [ConnectionController],
  providers: [
    SequelizeHealthIndicator,
    RedisHealthIndicator,
    ExternalAPIHealthIndicator,
    ...connectionCheckProviders,
    SftpHealthIndicator
  ]
})
export class ConnectionModule {}
