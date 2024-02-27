import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { AuthModule } from '@src/auth/auth.module';
import { DatabaseModule } from '@src/core/database/database.module';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { QueueModule } from '@src/core/service/queue/queue.module';
import { PermissionsService } from '@src/permissions/permissions.service';

import { UserProductProcessor } from './processors/userProducts.processor';
import { UserProductsService } from './service/userProducts.service';
import { UserProductsController } from './userProduct.controller';
import { userProductProviders } from './userProducts.providers';

@Module({
  imports: [
    QueueModule,
    BullModule.registerQueue({
      name: 'userProductQueue'
    }),
    DatabaseModule,
    AuthModule
  ],
  providers: [
    UserProductsService,
    ...userProductProviders,
    LoggerService,
    PermissionsService,
    UserProductProcessor
  ],
  controllers: [UserProductsController],
  exports: [UserProductsService, LoggerService, PermissionsService]
})
export class UserProductsModule {}
