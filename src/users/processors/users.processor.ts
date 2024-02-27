import { Process, Processor } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { USERS_REPOSITORY } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { Job } from 'bull';
import { Cache } from 'cache-manager';

import { UserCreateRequest, UserUpdateRequest } from '../dto';
import { User } from '../entity/user.entity';

@Processor('userQueue')
export class UserProcessor {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly userRepository: typeof User,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache
  ) {}

  @Process('addUserQueue')
  async processAddUser(job: Job<UserCreateRequest>) {
    const userData = job.data;
    const { name } = userData;

    const t = await this.userRepository.sequelize.transaction();

    try {
      this.logger.log('Starting add user in bull processor', '===running===');

      const createdUser = await this.userRepository.create<User>(userData, {
        transaction: t
      });

      await t.commit();
      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`userData${name}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'Add user in bull processor done',
        JSON.stringify(createdUser, null, 2)
      );
      return createdUser;
    } catch (error) {
      this.logger.error(
        'Add user in bull processor',
        'Error',
        JSON.stringify(error, null, 2)
      );
      await t.rollback();
      throw error;
    }
  }

  @Process('updateUserQueue')
  async processUpdateUser(job: Job<UserUpdateRequest>) {
    const userData = job.data;
    const { id, name } = userData;

    const t = await this.userRepository.sequelize.transaction();

    try {
      this.logger.log(
        'Starting update user in bull processor',
        '===running==='
      );

      const findUser = await User.findByPk(id);

      const updatedUser = await findUser.update(userData, {
        transaction: t
      });

      await t.commit();
      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`userData${name}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'Update user in bull processor done',
        JSON.stringify(updatedUser, null, 2)
      );
      return updatedUser;
    } catch (error) {
      this.logger.error('Update user in bull processor', 'Error', error);
      await t.rollback();
      throw error;
    }
  }
}
