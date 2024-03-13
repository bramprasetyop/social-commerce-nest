import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { LoggerService } from '../core/service/logger/logger.service';
import { QueueModule } from '../core/service/queue/queue.module';
import { LinksCronService } from './link/link.cron';
import { linkProviders } from './link/link.cron.providers';
import { LinkCronProcessor } from './link/processor/link.cron.processor';

@Module({
  imports: [
    QueueModule,
    BullModule.registerQueue({
      name: 'linkCronQueue'
    })
  ],
  providers: [
    LinksCronService,
    LoggerService,
    LinkCronProcessor,
    ...linkProviders
  ],

  controllers: [],
  exports: [LinksCronService, LoggerService]
})
export class CronModule {}
