import { Global, Module } from '@nestjs/common';

import { LoggerService } from '../logger/logger.service';
import { SftpService } from './sftp.service';

@Global()
@Module({
  providers: [SftpService, LoggerService],
  exports: [SftpService]
})
export class SftpModule {}
