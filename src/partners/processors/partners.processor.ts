import { Process, Processor } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { PARTNERS_REPOSITORY } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { Job } from 'bull';
import { Cache } from 'cache-manager';

import { PartnerCreateRequest, PartnerUpdateRequest } from '../dto';
import { Partner } from '../entity/partner.entity';

@Processor('partnerQueue')
export class PartnerProcessor {
  constructor(
    @Inject(PARTNERS_REPOSITORY)
    private readonly partnerRepository: typeof Partner,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache
  ) {}

  @Process('addPartnerQueue')
  async processAddPartner(job: Job<PartnerCreateRequest>) {
    const partnerData = job.data;
    const { name } = partnerData;

    const t = await this.partnerRepository.sequelize.transaction();

    try {
      this.logger.log(
        'Starting add partner in bull processor',
        '===running==='
      );

      const createdPartner = await this.partnerRepository.create<Partner>(
        partnerData,
        {
          transaction: t
        }
      );

      await t.commit();
      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`partnerData${name}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'Add partner in bull processor done',
        JSON.stringify(createdPartner, null, 2)
      );
      return createdPartner;
    } catch (error) {
      this.logger.error(
        'Add partner in bull processor',
        'Error',
        JSON.stringify(error, null, 2)
      );
      await t.rollback();
      throw error;
    }
  }

  @Process('updatePartnerQueue')
  async processUpdatePartner(job: Job<PartnerUpdateRequest>) {
    const partnerData = job.data;
    const { id } = partnerData;

    const t = await this.partnerRepository.sequelize.transaction();

    try {
      this.logger.log(
        'Starting update partner in bull processor',
        '===running==='
      );

      const findPartner = await Partner.findByPk(id);

      const updatedPartner = await findPartner.update(partnerData, {
        transaction: t
      });

      await t.commit();
      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`partnerData${id}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'Update partner in bull processor done',
        JSON.stringify(updatedPartner, null, 2)
      );
      return updatedPartner;
    } catch (error) {
      this.logger.error('Update partner in bull processor', 'Error', error);
      await t.rollback();
      throw error;
    }
  }
}
