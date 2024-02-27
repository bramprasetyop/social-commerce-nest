import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { AuthModule } from '@src/auth/auth.module';
import { DatabaseModule } from '@src/core/database/database.module';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { QueueModule } from '@src/core/service/queue/queue.module';
import { PermissionsService } from '@src/permissions/permissions.service';

import { PartnerUsersController } from './partnerUser.controller';
import { generateLinkProviders } from './partnerUsers.providers';
import { PartnerUserProcessor } from './processors/partnerUsers.processor';
import { PartnerUsersService } from './service/partnerUsers.service';

@Module({
  imports: [
    QueueModule,
    BullModule.registerQueue({
      name: 'partnerUserQueue'
    }),
    DatabaseModule,
    AuthModule
  ],
  providers: [
    PartnerUsersService,
    ...generateLinkProviders,
    LoggerService,
    PermissionsService,
    PartnerUserProcessor
  ],
  controllers: [PartnerUsersController],
  exports: [PartnerUsersService, LoggerService, PermissionsService]
})
export class PartnerUsersModule {}
