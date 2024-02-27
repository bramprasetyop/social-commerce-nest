import { Process, Processor } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { USER_PRODUCTS_REPOSITORY } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { Job } from 'bull';
import { Cache } from 'cache-manager';

import { UserProductCreateRequest, UserProductUpdateRequest } from '../dto';
import { UserProduct } from '../entity/userProduct.entity';

@Processor('userProductQueue')
export class UserProductProcessor {
  constructor(
    @Inject(USER_PRODUCTS_REPOSITORY)
    private readonly userProductRepository: typeof UserProduct,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache
  ) {}

  @Process('addUserProductQueue')
  async processAddUserProduct(job: Job<UserProductCreateRequest>) {
    const userProductData = job.data;
    const { userId } = userProductData;

    const t = await this.userProductRepository.sequelize.transaction();

    try {
      this.logger.log(
        'Starting add userProduct in bull processor',
        '===running==='
      );

      const createdUserProduct =
        await this.userProductRepository.create<UserProduct>(userProductData, {
          transaction: t
        });

      await t.commit();
      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`userProductData${userId}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'Add userProduct in bull processor done',
        JSON.stringify(createdUserProduct, null, 2)
      );
      return createdUserProduct;
    } catch (error) {
      this.logger.error(
        'Add userProduct in bull processor',
        'Error',
        JSON.stringify(error, null, 2)
      );
      await t.rollback();
      throw error;
    }
  }

  @Process('updateUserProductQueue')
  async processUpdateUserProduct(job: Job<UserProductUpdateRequest>) {
    const userProductData = job.data;
    const { id, userId } = userProductData;

    const t = await this.userProductRepository.sequelize.transaction();

    try {
      this.logger.log(
        'Starting update userProduct in bull processor',
        '===running==='
      );

      const findUserProduct = await UserProduct.findByPk(id);

      const updatedUserProduct = await findUserProduct.update(userProductData, {
        transaction: t
      });

      await t.commit();
      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`userProductData${userId}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'Update userProduct in bull processor done',
        JSON.stringify(updatedUserProduct, null, 2)
      );
      return updatedUserProduct;
    } catch (error) {
      this.logger.error('Update userProduct in bull processor', 'Error', error);
      await t.rollback();
      throw error;
    }
  }
}
