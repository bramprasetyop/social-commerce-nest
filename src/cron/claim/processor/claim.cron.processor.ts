import { Process, Processor } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Claim } from '@src/claims/entity/claim.entity';
import { CLAIMS_REPOSITORY } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { Job } from 'bull';
import { Cache } from 'cache-manager';

@Processor('claimCronQueue')
export class ClaimCronProcessor {
  constructor(
    private readonly logger: LoggerService,
    @Inject(CLAIMS_REPOSITORY)
    private readonly claimRepository: typeof Claim,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache
  ) {}

  @Process('getClaimCronQueue')
  async processGetClaim(job: Job<any>) {
    const claims = job.data;
    console.log(claims);
    const transaction = await this.claimRepository.sequelize.transaction();

    try {
      this.logger.log(
        'starting run cron get draft claim in bull processor',
        '===running==='
      );

      await transaction.commit();

      this.logger.log(
        'run cron get claim in bull processor done',
        '======finish======'
      );
      return true;
    } catch (error) {
      await transaction.rollback();
      this.logger.error(
        'run cron get claim in bull processor',
        'error',
        JSON.stringify(error, null, 2)
      );
    }
  }
}
