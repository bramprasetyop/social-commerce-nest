import { Process, Processor } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { GENERATE_LINK_REPOSITORY } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { Job } from 'bull';
import { Cache } from 'cache-manager';

import { GenerateLinkCreateRequest, GenerateLinkUpdateRequest } from '../dto';
import { GenerateLink } from '../entity/generateLink.entity';

@Processor('generateLinkQueue')
export class GenerateLinkProcessor {
  constructor(
    @Inject(GENERATE_LINK_REPOSITORY)
    private readonly generateLinkRepository: typeof GenerateLink,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache
  ) {}

  @Process('addGenerateLinkQueue')
  async processAddGenerateLink(job: Job<GenerateLinkCreateRequest>) {
    const generateLinkData = job.data;
    const { userId } = generateLinkData;

    const t = await this.generateLinkRepository.sequelize.transaction();

    try {
      this.logger.log(
        'Starting add generate link in bull processor',
        '===running==='
      );

      const createdGenerateLink =
        await this.generateLinkRepository.create<GenerateLink>(
          generateLinkData,
          {
            transaction: t
          }
        );

      await t.commit();
      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`generateLinkData${userId}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'Add generate link in bull processor done',
        JSON.stringify(createdGenerateLink, null, 2)
      );
      return createdGenerateLink;
    } catch (error) {
      this.logger.error(
        'Add generate link in bull processor',
        'Error',
        JSON.stringify(error, null, 2)
      );
      await t.rollback();
      throw error;
    }
  }

  @Process('updateGenerateLinkQueue')
  async processUpdateGenerateLink(job: Job<GenerateLinkUpdateRequest>) {
    const generateLinkData = job.data;
    const { id, userId } = generateLinkData;

    const t = await this.generateLinkRepository.sequelize.transaction();

    try {
      this.logger.log(
        'Starting update generate link in bull processor',
        '===running==='
      );

      const findGenerateLink = await GenerateLink.findByPk(id);

      const updatedGenerateLink = await findGenerateLink.update(
        generateLinkData,
        {
          transaction: t
        }
      );

      await t.commit();
      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`generateLinkData${userId}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'Update generate link in bull processor done',
        JSON.stringify(updatedGenerateLink, null, 2)
      );
      return updatedGenerateLink;
    } catch (error) {
      this.logger.error(
        'Update generate link in bull processor',
        'Error',
        error
      );
      await t.rollback();
      throw error;
    }
  }
}
