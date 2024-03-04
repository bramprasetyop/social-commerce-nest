import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { AuthModule } from '@src/auth/auth.module';
import { DatabaseModule } from '@src/core/database/database.module';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { QueueModule } from '@src/core/service/queue/queue.module';
import { PermissionsService } from '@src/permissions/permissions.service';

import { UserHeirProcessor } from './processors/userHeirs.processor';
import { UserHeirsService } from './service/userHeirs.service';
import { UserHeirsController } from './userHeir.controller';
import { userProviders } from './userHeirs.providers';

@Module({
  imports: [
    QueueModule,
    BullModule.registerQueue({
      name: 'userHeirQueue'
    }),
    DatabaseModule,
    AuthModule
  ],
  providers: [
    UserHeirsService,
    ...userProviders,
    LoggerService,
    PermissionsService,
    UserHeirProcessor
  ],
  controllers: [UserHeirsController],
  exports: [UserHeirsService, LoggerService, PermissionsService]
})
export class UserHeirsModule {}
