import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { LoggerService } from '../core/service/logger/logger.service';
import { QueueModule } from '../core/service/queue/queue.module';
import { ClaimsCronService } from './claim/claim.cron';
import { claimProviders } from './claim/claim.cron.providers';
import { ClaimCronProcessor } from './claim/processor/claim.cron.processor';

@Module({
  imports: [
    QueueModule,
    BullModule.registerQueue({
      name: 'claimCronQueue'
    })
  ],
  providers: [
    ClaimsCronService,
    LoggerService,
    ClaimCronProcessor,
    ...claimProviders
  ],

  controllers: [],
  exports: [ClaimsCronService, LoggerService]
})
export class CronModule {}
