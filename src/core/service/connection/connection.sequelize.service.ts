import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { Claim } from '@src/claims/entity/claim.entity';
import { CLAIMS_REPOSITORY } from '@src/core/constants';

@Injectable()
export class SequelizeHealthIndicator extends HealthIndicator {
  sequelize: any;
  constructor(
    @Inject(CLAIMS_REPOSITORY)
    private readonly companyDocumentCutOffRepository: typeof Claim
  ) {
    super();
    this.sequelize = this.companyDocumentCutOffRepository.sequelize;
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this.sequelize.authenticate();
      return this.getStatus('database', true);
    } catch (error) {
      return this.getStatus('database', false, { message: error.message });
    }
  }
}
