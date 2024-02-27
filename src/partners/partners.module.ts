import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { AuthModule } from '@src/auth/auth.module';
import { DatabaseModule } from '@src/core/database/database.module';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { QueueModule } from '@src/core/service/queue/queue.module';
import { PermissionsService } from '@src/permissions/permissions.service';

import { PartnersController } from './partner.controller';
import { PartnerProviders } from './partners.providers';
import { PartnerProcessor } from './processors/partners.processor';
import { PartnersService } from './service/partners.service';

@Module({
  imports: [
    QueueModule,
    BullModule.registerQueue({
      name: 'partnerQueue'
    }),
    DatabaseModule,
    AuthModule
  ],
  providers: [
    PartnersService,
    ...PartnerProviders,
    LoggerService,
    PermissionsService,
    PartnerProcessor
  ],
  controllers: [PartnersController],
  exports: [PartnersService, LoggerService, PermissionsService]
})
export class PartnersModule {}
