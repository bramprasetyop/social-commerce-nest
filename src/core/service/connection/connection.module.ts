import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DatabaseModule } from '@src/core/database/database.module';

import { EliOpenAPIHealthIndicator } from './connection.EliOpenAPI.service';
import { ConnectionController } from './connection.controller';
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
    EliOpenAPIHealthIndicator,
    ...connectionCheckProviders,
    SftpHealthIndicator
  ]
})
export class ConnectionModule {}
