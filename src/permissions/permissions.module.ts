import { Module } from '@nestjs/common';
import { LoggerService } from '@src/core/service/logger/logger.service';

import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

@Module({
  providers: [PermissionsService, LoggerService],
  controllers: [PermissionsController],
  exports: [PermissionsService, LoggerService]
})
export class PermissionsModule {}
