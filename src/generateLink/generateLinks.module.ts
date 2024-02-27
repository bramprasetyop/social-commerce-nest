import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { AuthModule } from '@src/auth/auth.module';
import { DatabaseModule } from '@src/core/database/database.module';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { QueueModule } from '@src/core/service/queue/queue.module';
import { PermissionsService } from '@src/permissions/permissions.service';

import { GenerateLinksController } from './generateLink.controller';
import { generateLinkProviders } from './generateLinks.providers';
import { GenerateLinkProcessor } from './processors/generateLinks.processor';
import { GenerateLinkService } from './service/generateLinks.service';

@Module({
  imports: [
    QueueModule,
    BullModule.registerQueue({
      name: 'generateLinkQueue'
    }),
    DatabaseModule,
    AuthModule
  ],
  providers: [
    GenerateLinkService,
    ...generateLinkProviders,
    LoggerService,
    PermissionsService,
    GenerateLinkProcessor
  ],
  controllers: [GenerateLinksController],
  exports: [GenerateLinkService, LoggerService, PermissionsService]
})
export class GenerateLinksModule {}
