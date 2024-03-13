import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { PARTNERS_REPOSITORY } from '@src/core/constants';
import { Partner } from '@src/partners/entity/partner.entity';

@Injectable()
export class SequelizeHealthIndicator extends HealthIndicator {
  sequelize: any;
  constructor(
    @Inject(PARTNERS_REPOSITORY)
    private readonly partnerRepository: typeof Partner
  ) {
    super();
    this.sequelize = this.partnerRepository.sequelize;
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
