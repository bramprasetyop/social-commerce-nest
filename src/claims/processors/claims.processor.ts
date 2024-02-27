import { Process, Processor } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { CLAIMS_REPOSITORY } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { Job } from 'bull';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import { Op } from 'sequelize';

import { ClaimCreateRequest, ClaimUpdateRequest } from '../dto';
import { Claim } from '../entity/claim.entity';

@Processor('claimQueue')
export class ClaimProcessor {
  constructor(
    @Inject(CLAIMS_REPOSITORY)
    private readonly claimRepository: typeof Claim,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache
  ) {}

  async generateNoKlaim() {
    const year = moment().format('YYYY');
    let noKlaim = `B${year}.00001`;

    function incrementNoKlaim(str: string) {
      const number = parseInt(str, 10) + 1;
      return String(number).padStart(str.length, '0');
    }

    const latestNoKlaim = await this.claimRepository.findOne({
      where: {
        noKlaim: { [Op.like]: `B${year}.%` }
      },
      paranoid: false,
      order: [['created_at', 'DESC']]
    });

    if (latestNoKlaim) {
      const [, lastSeq] = latestNoKlaim.noKlaim.split('.');
      const newSeq = await incrementNoKlaim(lastSeq);
      noKlaim = `B${year}.${newSeq}`;
    }
    return noKlaim;
  }

  @Process('addClaimQueue')
  async processAddClaim(job: Job<ClaimCreateRequest>) {
    const claimData = job.data;
    const { userId } = claimData;

    const t = await this.claimRepository.sequelize.transaction();

    try {
      this.logger.log('Starting add claim in bull processor', '===running===');

      const createdClaim = await this.claimRepository.create<Claim>(claimData, {
        transaction: t
      });

      await t.commit();
      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`claimData${userId}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'Add claim in bull processor done',
        JSON.stringify(createdClaim, null, 2)
      );
      return createdClaim;
    } catch (error) {
      this.logger.error(
        'Add claim in bull processor',
        'Error',
        JSON.stringify(error, null, 2)
      );
      await t.rollback();
      throw error;
    }
  }

  @Process('updateClaimQueue')
  async processUpdateClaim(job: Job<ClaimUpdateRequest>) {
    const claimData = job.data;
    const { id, statusSubmit, userId } = claimData;

    const t = await this.claimRepository.sequelize.transaction();

    try {
      this.logger.log(
        'Starting update claim in bull processor',
        '===running==='
      );

      const now = moment();
      const findClaim = await Claim.findByPk(id);

      if (statusSubmit === '1') {
        Object.assign(claimData, {
          statusSubmit: statusSubmit,
          isResubmit: true,
          submitCounter: findClaim?.submitCounter + 1
        });

        if (!findClaim?.noKlaim) {
          let resultNoKlaim = await this.generateNoKlaim();
          const findExistingClaim = await Claim.findOne({
            where: { noKlaim: resultNoKlaim }
          });

          if (findExistingClaim) {
            this.logger.log(
              'Existing no claim in bull processor found',
              `${findExistingClaim?.noKlaim}`
            );

            resultNoKlaim = await this.generateNoKlaim();
            this.logger.log(
              'Reregenerate no claim in bull processor success',
              `${resultNoKlaim}`
            );
          }
          Object.assign(claimData, {
            noKlaim: resultNoKlaim,
            updatedAt: now.toISOString()
          });
        }
      }

      const updatedClaim = await findClaim.update(claimData, {
        transaction: t
      });

      if (statusSubmit === '0') {
        await t.commit();
        const keys = await this.cacheService.store.keys();
        const keysToDelete = keys.filter(key =>
          key.startsWith(`claimData${userId}`)
        );

        for (const keyToDelete of keysToDelete) {
          await this.cacheService.del(keyToDelete);
        }

        this.logger.log(
          'Update claim in bull processor done for status 0',
          JSON.stringify(updatedClaim, null, 2)
        );
        return updatedClaim;
      }

      await t.commit();
      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`claimData${userId}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'Update claim in bull processor done',
        JSON.stringify(updatedClaim, null, 2)
      );
      return updatedClaim;
    } catch (error) {
      this.logger.error('Update claim in bull processor', 'Error', error);
      await t.rollback();
      throw error;
    }
  }
}
