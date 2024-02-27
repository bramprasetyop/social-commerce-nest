import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REDIS_CACHE_TTL, USERS_REPOSITORY } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';
import * as dotenv from 'dotenv';

import { UserCreateRequest, UserUpdateRequest } from '../dto';
import { User } from '../entity/user.entity';
import { PagingUser } from './users.interface';

dotenv.config();

@Injectable()
export class UsersService {
  private readonly host: string;
  sequelize: any;
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly userRepository: typeof User,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(CACHE_MANAGER) private cacheStoreService: CacheStore,
    @InjectQueue('userQueue') private userQueue: Queue
  ) {
    this.sequelize = this.userRepository.sequelize;
  }
  async findAll(
    userId: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<PagingUser> {
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
        `userData${userId}${currentPage}${perPage}`
      );

      if (cachedData) {
        this.logger.log(
          'response get all user document through existing cached',
          'success'
        );
        return cachedData;
      }

      this.logger.log('starting get all users through db', '===running===');

      const response = await this.userRepository.findAndCountAll({
        limit: perPage,
        offset,
        order: [['updatedAt', 'DESC']]
      });

      this.logger.log(
        'success get all users through db',
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

      // save users to redis
      this.cacheStoreService.set(
        `userData${userId}${currentPage}${perPage}`,
        result,
        // save to redis for 4 hours
        { ttl: REDIS_CACHE_TTL / 6 }
      );

      return result;
    } catch (error) {
      this.logger.error(
        'error get all users through db',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async findById(userId: string, id: number): Promise<User> {
    try {
      this.logger.log(
        'starting get detail user through existing cached',
        '===running==='
      );
      // get user detail from redis
      const cachedData = await this.cacheService.get<User>(
        `userData${userId}${id}`
      );

      if (cachedData) {
        this.logger.log(
          'response get detail user through existing cached',
          'success'
        );
        return cachedData;
      }

      this.logger.log('starting get detail user through db', '===running===');

      const response = await this.userRepository.findOne({
        where: {
          id
        }
      });

      if (!response) {
        this.logger.error(
          '===== Error while find user by id on find by id =====',
          `Error: `,
          'ID klaim tidak ditemukan'
        );
        throw new NotFoundException(
          'ID klaim tidak ditemukan, Mohon periksa kembali.'
        );
      }

      this.logger.log(
        'success get detail user through db',
        JSON.stringify(response, null, 2)
      );

      // save user detail to redis
      this.cacheStoreService.set(`userData${userId}${id}`, response, {
        // save to redis for 4 hours
        ttl: REDIS_CACHE_TTL / 6
      });

      return response;
    } catch (error) {
      this.logger.error(
        'error get detail user through db',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async create(dto: UserCreateRequest): Promise<any> {
    try {
      this.logger.log('starting create user through BullMQ', '===running===');

      let createUserResponse;
      const job = await this.userQueue.add('addUserQueue', dto);
      // eslint-disable-next-line prefer-const
      createUserResponse = await job.finished();
      this.logger.log('success add user to db', JSON.stringify(dto, null, 2));

      return {
        statusCode: 201,
        statusDescription: 'Create user success!',
        data: createUserResponse
      };
    } catch (error) {
      this.logger.error(
        'error create user through BullMQ',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async update(dto: UserUpdateRequest): Promise<any> {
    const { id } = dto;
    try {
      this.logger.log('starting update user through BullMQ', '===running===');

      const findUser = await User.findByPk(id);

      if (!findUser) {
        this.logger.error(
          '===== Error while find user by id on update =====',
          `Error: `,
          'ID klaim tidak ditemukan'
        );
        throw new NotFoundException(
          'ID klaim tidak ditemukan, Mohon periksa kembali.'
        );
      }

      const job = await this.userQueue.add('updateUserQueue', dto);

      const response = await job.finished();

      this.logger.log(
        'success update user to db',
        JSON.stringify(dto, null, 2)
      );

      return {
        statusCode: 201,
        statusDescription: 'Update user success!',
        data: response
      };
    } catch (error) {
      this.logger.error(
        'error update user through BullMQ',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async delete(userId: string, id: string): Promise<any> {
    try {
      this.logger.log('starting delete user', '===running===');

      const response = await this.userRepository.destroy({
        where: { id }
      });

      if (!response) {
        this.logger.error(
          '===== Error user by id =====',
          `Error: `,
          'ID User tidak ditemukan.'
        );
        throw new NotFoundException(
          'ID User tidak ditemukan, Mohon periksa kembali.'
        );
      }

      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`userData${userId}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log('success delete user', JSON.stringify(response, null, 2));

      return {
        statusCode: 201,
        statusDescription: 'Berhasil menghapus User.'
      };
    } catch (error) {
      this.logger.error(
        'error delete user',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }
}
