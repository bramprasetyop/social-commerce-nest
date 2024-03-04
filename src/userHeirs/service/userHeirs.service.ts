import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REDIS_CACHE_TTL, USERS_REPOSITORY } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';
import * as dotenv from 'dotenv';

import { UserHeirCreateRequest, UserHeirUpdateRequest } from '../dto';
import { UserHeir } from '../entity/userHeir.entity';
import { PagingUserHeir } from './userHeirs.interface';

dotenv.config();

@Injectable()
export class UserHeirsService {
  private readonly host: string;
  sequelize: any;
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly userHeirRepository: typeof UserHeir,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(CACHE_MANAGER) private cacheStoreService: CacheStore,
    @InjectQueue('userHeirQueue') private userHeirQueue: Queue
  ) {
    this.sequelize = this.userHeirRepository.sequelize;
  }
  async findAll(
    userId: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<PagingUserHeir> {
    try {
      const currentPage = page && page >= 1 ? page : 1;

      this.logger.log(
        'starting get all users through existing cached',
        '===running==='
      );

      // Calculate the offset based on the page and perpage values
      const offset = (currentPage - 1) * perPage;

      // get users from redis
      const cachedData = await this.cacheService.get<any>(
        `userHeirData${userId}${currentPage}${perPage}`
      );

      if (cachedData) {
        this.logger.log(
          'response get all user heir through existing cached',
          'success'
        );
        return cachedData;
      }

      this.logger.log(
        'starting get all user heirs through db',
        '===running==='
      );

      const response = await this.userHeirRepository.findAndCountAll({
        limit: perPage,
        offset,
        order: [['updatedAt', 'DESC']]
      });

      this.logger.log(
        'success get all user heirs through db',
        JSON.stringify(response, null, 2)
      );

      const modifiedResponse = {
        ...response,
        rows: response.rows
      };

      const result = {
        statusCode: modifiedResponse.rows ? 200 : 204,
        data: modifiedResponse.rows,
        meta: {
          total: modifiedResponse.count,
          pageSize: perPage,
          currentPage,
          totalPage: Math.ceil(modifiedResponse.count / perPage)
        }
      };

      // save user heirs to redis
      this.cacheStoreService.set(
        `userHeirData${userId}${currentPage}${perPage}`,
        result,
        // save to redis for 4 hours
        { ttl: REDIS_CACHE_TTL / 6 }
      );

      return result;
    } catch (error) {
      this.logger.error(
        'error get all user heirs through db',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async findById(userId: string, id: string): Promise<UserHeir> {
    try {
      this.logger.log(
        'starting get detail user heir through existing cached',
        '===running==='
      );
      // get user detail from redis
      const cachedData = await this.cacheService.get<UserHeir>(
        `userHeirData${userId}${id}`
      );

      if (cachedData) {
        this.logger.log(
          'response get detail user heir through existing cached',
          'success'
        );
        return cachedData;
      }

      this.logger.log(
        'starting get detail user heir through db',
        '===running==='
      );

      const response = await this.userHeirRepository.findByPk(id);

      if (!response) {
        this.logger.error(
          '===== Error while find user heir by id on find by id =====',
          `Error: `,
          'ID klaim tidak ditemukan'
        );
        throw new NotFoundException(
          'ID klaim tidak ditemukan, Mohon periksa kembali.'
        );
      }

      this.logger.log(
        'success get detail user heir through db',
        JSON.stringify(response, null, 2)
      );

      // save user detail to redis
      this.cacheStoreService.set(`userHeirData${userId}${id}`, response, {
        // save to redis for 4 hours
        ttl: REDIS_CACHE_TTL / 6
      });

      return response;
    } catch (error) {
      this.logger.error(
        'error get detail user heir through db',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async create(dto: UserHeirCreateRequest): Promise<any> {
    try {
      this.logger.log(
        'starting create user heir through BullMQ',
        '===running==='
      );

      const job = await this.userHeirQueue.add('addUserHeirQueue', dto);
      const createUserResponse = await job.finished();
      this.logger.log(
        'success add user heir to db',
        JSON.stringify(dto, null, 2)
      );

      return {
        statusCode: 201,
        statusDescription: 'Create user heir success!',
        data: createUserResponse
      };
    } catch (error) {
      this.logger.error(
        'error create user heir through BullMQ',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async update(dto: UserHeirUpdateRequest): Promise<any> {
    const { id } = dto;
    try {
      this.logger.log(
        'starting update user heir through BullMQ',
        '===running==='
      );

      const findUser = await UserHeir.findByPk(id);

      if (!findUser) {
        this.logger.error(
          '===== Error while find user heir by id on update =====',
          `Error: `,
          'ID klaim tidak ditemukan'
        );
        throw new NotFoundException(
          'ID klaim tidak ditemukan, Mohon periksa kembali.'
        );
      }

      const job = await this.userHeirQueue.add('updateUserHeirQueue', dto);

      const response = await job.finished();

      this.logger.log(
        'success update user heir to db',
        JSON.stringify(dto, null, 2)
      );

      return {
        statusCode: 201,
        statusDescription: 'Update user heir success!',
        data: response
      };
    } catch (error) {
      this.logger.error(
        'error update user heir through BullMQ',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async delete(deletedBy: string, id: string): Promise<any> {
    const transaction = await this.sequelize.transaction();

    try {
      this.logger.log('starting delete user heir', '===running===');

      const userHeir = await this.userHeirRepository.findByPk(id);

      if (!userHeir) {
        this.logger.error(
          '===== Error user heir by id =====',
          `Error: `,
          'ID user heir tidak ditemukan.'
        );
        throw new NotFoundException(
          'ID user heir tidak ditemukan, Mohon periksa kembali.'
        );
      }

      await userHeir.update(
        { deletedBy },
        {
          transaction
        }
      );

      const response = await this.userHeirRepository.destroy({
        where: { id },
        transaction
      });

      await transaction.commit();

      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`userHeirData${deletedBy}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'success delete user heir',
        JSON.stringify(response, null, 2)
      );

      return {
        statusCode: 201,
        statusDescription: 'Berhasil menghapus user heir.'
      };
    } catch (error) {
      this.logger.error(
        'error delete user heir',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      await transaction.rollback();
      throw new Error(error.message);
    }
  }
}
