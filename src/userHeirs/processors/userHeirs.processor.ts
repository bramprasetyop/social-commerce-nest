import { Process, Processor } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { USERS_REPOSITORY } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { Job } from 'bull';
import { Cache } from 'cache-manager';

import { UserHeirCreateRequest, UserHeirUpdateRequest } from '../dto';
import { UserHeir } from '../entity/userHeir.entity';

@Processor('userHeirQueue')
export class UserHeirProcessor {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly userRepository: typeof UserHeir,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache
  ) {}

  @Process('addUserHeirQueue')
  async processAddUser(job: Job<UserHeirCreateRequest>) {
    const userHeirData = job.data;
    const { createdBy } = userHeirData;

    const t = await this.userRepository.sequelize.transaction();

    try {
      this.logger.log(
        'Starting add user heir in bull processor',
        '===running==='
      );

      const createdUser = await this.userRepository.create<UserHeir>(
        userHeirData,
        {
          transaction: t
        }
      );

      await t.commit();
      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`userHeirData${createdBy}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'Add user heir in bull processor done',
        JSON.stringify(createdUser, null, 2)
      );
      return createdUser;
    } catch (error) {
      this.logger.error(
        'Add user heir in bull processor',
        'Error',
        JSON.stringify(error, null, 2)
      );
      await t.rollback();
      throw error;
    }
  }

  @Process('updateUserHeirQueue')
  async processUpdateUser(job: Job<UserHeirUpdateRequest>) {
    const userHeirData = job.data;
    const { id, updatedBy } = userHeirData;

    const t = await this.userRepository.sequelize.transaction();

    try {
      this.logger.log(
        'Starting update user heir in bull processor',
        '===running==='
      );

      const findUser = await UserHeir.findByPk(id);

      const updatedUser = await findUser.update(userHeirData, {
        transaction: t
      });

      await t.commit();
      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`userHeirData${updatedBy}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'Update user heir in bull processor done',
        JSON.stringify(updatedUser, null, 2)
      );
      return updatedUser;
    } catch (error) {
      this.logger.error('Update user heir in bull processor', 'Error', error);
      await t.rollback();
      throw error;
    }
  }
}
