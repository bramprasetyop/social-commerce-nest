import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { AuthModule } from '@src/auth/auth.module';
import { DatabaseModule } from '@src/core/database/database.module';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { QueueModule } from '@src/core/service/queue/queue.module';
import { PermissionsService } from '@src/permissions/permissions.service';

import { UserProcessor } from './processors/users.processor';
import { UsersService } from './service/users.service';
import { UsersController } from './user.controller';
import { userProviders } from './users.providers';

@Module({
  imports: [
    QueueModule,
    BullModule.registerQueue({
      name: 'userQueue'
    }),
    DatabaseModule,
    AuthModule
  ],
  providers: [
    UsersService,
    ...userProviders,
    LoggerService,
    PermissionsService,
    UserProcessor
  ],
  controllers: [UsersController],
  exports: [UsersService, LoggerService, PermissionsService]
})
export class UsersModule {}
