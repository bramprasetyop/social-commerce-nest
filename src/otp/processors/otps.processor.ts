import { Process, Processor } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { OTP_REPOSITORY } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { Job } from 'bull';
import { Cache } from 'cache-manager';

import { OtpCreateRequest, OtpUpdateRequest } from '../dto';
import { OTP } from '../entity/otp.entity';

@Processor('otpQueue')
export class OtpProcessor {
  constructor(
    @Inject(OTP_REPOSITORY)
    private readonly otpRepository: typeof OTP,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache
  ) {}

  @Process('addOtpQueue')
  async processAddOtp(job: Job<OtpCreateRequest>) {
    const otpData = job.data;
    const { userId } = otpData;

    const t = await this.otpRepository.sequelize.transaction();

    try {
      this.logger.log('Starting add otp in bull processor', '===running===');

      const createdOtp = await this.otpRepository.create<OTP>(otpData, {
        transaction: t
      });

      await t.commit();
      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`otpData${userId}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'Add otp in bull processor done',
        JSON.stringify(createdOtp, null, 2)
      );
      return createdOtp;
    } catch (error) {
      this.logger.error(
        'Add otp in bull processor',
        'Error',
        JSON.stringify(error, null, 2)
      );
      await t.rollback();
      throw error;
    }
  }

  @Process('updateOtpQueue')
  async processUpdateOtp(job: Job<OtpUpdateRequest>) {
    const otpData = job.data;
    const { id, userId } = otpData;

    const t = await this.otpRepository.sequelize.transaction();

    try {
      this.logger.log('Starting update otp in bull processor', '===running===');

      const findOtp = await OTP.findByPk(id);

      const updatedOtp = await findOtp.update(otpData, {
        transaction: t
      });

      await t.commit();
      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`otpData${userId}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'Update otp in bull processor done',
        JSON.stringify(updatedOtp, null, 2)
      );
      return updatedOtp;
    } catch (error) {
      this.logger.error('Update otp in bull processor', 'Error', error);
      await t.rollback();
      throw error;
    }
  }
}
