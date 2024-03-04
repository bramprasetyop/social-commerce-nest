import { Process, Processor } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { PARTNER_USERS_REPOSITORY } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { Job } from 'bull';
import { Cache } from 'cache-manager';

import { PartnerUserCreateRequest, PartnerUserUpdateRequest } from '../dto';
import { PartnerUser } from '../entity/partnerUser.entity';

@Processor('partnerUserQueue')
export class PartnerUserProcessor {
  constructor(
    @Inject(PARTNER_USERS_REPOSITORY)
    private readonly partnerUserRepository: typeof PartnerUser,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache
  ) {}

  @Process('addPartnerUserQueue')
  async processAddPartnerUser(job: Job<PartnerUserCreateRequest>) {
    const partnerUserData = job.data;
    const { createdBy } = partnerUserData;

    const t = await this.partnerUserRepository.sequelize.transaction();

    try {
      this.logger.log(
        'Starting add partnerUser in bull processor',
        '===running==='
      );

      const createdPartnerUser =
        await this.partnerUserRepository.create<PartnerUser>(partnerUserData, {
          transaction: t
        });

      await t.commit();
      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`partnerUserData${createdBy}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'Add partnerUser in bull processor done',
        JSON.stringify(createdPartnerUser, null, 2)
      );
      return createdPartnerUser;
    } catch (error) {
      this.logger.error(
        'Add partnerUser in bull processor',
        'Error',
        JSON.stringify(error, null, 2)
      );
      await t.rollback();
      throw error;
    }
  }

  @Process('updatePartnerUserQueue')
  async processUpdatePartnerUser(job: Job<PartnerUserUpdateRequest>) {
    const partnerUserData = job.data;
    const { id, updatedBy } = partnerUserData;

    const t = await this.partnerUserRepository.sequelize.transaction();

    try {
      this.logger.log(
        'Starting update partnerUser in bull processor',
        '===running==='
      );

      const findPartnerUser = await PartnerUser.findByPk(id);

      const updatedPartnerUser = await findPartnerUser.update(partnerUserData, {
        transaction: t
      });

      await t.commit();
      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`partnerUserData${updatedBy}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'Update partnerUser in bull processor done',
        JSON.stringify(updatedPartnerUser, null, 2)
      );
      return updatedPartnerUser;
    } catch (error) {
      this.logger.error('Update partnerUser in bull processor', 'Error', error);
      await t.rollback();
      throw error;
    }
  }
}
