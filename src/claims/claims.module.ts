import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { AuthModule } from '@src/auth/auth.module';
import { DatabaseModule } from '@src/core/database/database.module';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { QueueModule } from '@src/core/service/queue/queue.module';
import { PermissionsService } from '@src/permissions/permissions.service';

import { ClaimsController } from './claims.controller';
import { claimProviders } from './claims.providers';
import { ClaimProcessor } from './processors/claims.processor';
import { ClaimsService } from './service/claims.service';

@Module({
  imports: [
    QueueModule,
    BullModule.registerQueue(
      {
        name: 'claimQueue'
      },
      {
        name: 'portalMemberClaimQueue'
      },
      {
        name: 'claimCronQueue'
      }
    ),
    DatabaseModule,
    AuthModule
  ],
  providers: [
    ClaimsService,
    ...claimProviders,
    LoggerService,
    PermissionsService,
    ClaimProcessor
  ],
  controllers: [ClaimsController],
  exports: [ClaimsService, LoggerService, PermissionsService]
})
export class ClaimsModule {}
