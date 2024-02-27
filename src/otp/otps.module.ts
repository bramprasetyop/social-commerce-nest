import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { AuthModule } from '@src/auth/auth.module';
import { DatabaseModule } from '@src/core/database/database.module';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { QueueModule } from '@src/core/service/queue/queue.module';
import { PermissionsService } from '@src/permissions/permissions.service';

import { OtpsController } from './otp.controller';
import { OTPProviders } from './otp.providers';
import { OtpProcessor } from './processors/otps.processor';
import { OtpsService } from './service/otps.service';

@Module({
  imports: [
    QueueModule,
    BullModule.registerQueue({
      name: 'otpQueue'
    }),
    DatabaseModule,
    AuthModule
  ],
  providers: [
    OtpsService,
    ...OTPProviders,
    LoggerService,
    PermissionsService,
    OtpProcessor
  ],
  controllers: [OtpsController],
  exports: [OtpsService, LoggerService, PermissionsService]
})
export class OtpsModule {}
