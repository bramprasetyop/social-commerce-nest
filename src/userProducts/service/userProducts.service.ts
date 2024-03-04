import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REDIS_CACHE_TTL, USER_PRODUCTS_REPOSITORY } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';
import * as dotenv from 'dotenv';

import { UserProductCreateRequest, UserProductUpdateRequest } from '../dto';
import { UserProduct } from '../entity/userProduct.entity';
import { PagingUserProduct } from './userProducts.interface';

dotenv.config();

@Injectable()
export class UserProductsService {
  private readonly host: string;
  sequelize: any;
  constructor(
    @Inject(USER_PRODUCTS_REPOSITORY)
    private readonly userProductRepository: typeof UserProduct,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(CACHE_MANAGER) private cacheStoreService: CacheStore,
    @InjectQueue('userProductQueue') private userProductQueue: Queue
  ) {
    this.sequelize = this.userProductRepository.sequelize;
  }
  async findAll(
    userId: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<PagingUserProduct> {
    try {
      const currentPage = page && page >= 1 ? page : 1;

      this.logger.log(
        'starting get all userProducts through existing cached',
        '===running==='
      );

      // Calculate the offset based on the page and perpage values
      const offset = (currentPage - 1) * perPage;

      // get userProducts from redis
      const cachedData = await this.cacheService.get<any>(
        `userProductData${userId}${currentPage}${perPage}`
      );

      if (cachedData) {
        this.logger.log(
          'response get all userProduct document through existing cached',
          'success'
        );
        return cachedData;
      }

      this.logger.log(
        'starting get all userProducts through db',
        '===running==='
      );

      const response = await this.userProductRepository.findAndCountAll({
        limit: perPage,
        offset,
        order: [['updatedAt', 'DESC']]
      });

      this.logger.log(
        'success get all userProducts through db',
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

      // save userProducts to redis
      this.cacheStoreService.set(
        `userProductData${userId}${currentPage}${perPage}`,
        result,
        // save to redis for 4 hours
        { ttl: REDIS_CACHE_TTL / 6 }
      );

      return result;
    } catch (error) {
      this.logger.error(
        'error get all userProducts through db',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async findById(userId: string, id: string): Promise<UserProduct> {
    try {
      this.logger.log(
        'starting get detail userProduct through existing cached',
        '===running==='
      );
      // get userProduct detail from redis
      const cachedData = await this.cacheService.get<UserProduct>(
        `userProductData${userId}${id}`
      );

      if (cachedData) {
        this.logger.log(
          'response get detail userProduct through existing cached',
          'success'
        );
        return cachedData;
      }

      this.logger.log(
        'starting get detail userProduct through db',
        '===running==='
      );

      const response = await this.userProductRepository.findByPk(id);

      if (!response) {
        this.logger.error(
          '===== Error while find userProduct by id on find by id =====',
          `Error: `,
          'ID klaim tidak ditemukan'
        );
        throw new NotFoundException(
          'ID klaim tidak ditemukan, Mohon periksa kembali.'
        );
      }

      this.logger.log(
        'success get detail userProduct through db',
        JSON.stringify(response, null, 2)
      );

      // save userProduct detail to redis
      this.cacheStoreService.set(`userProductData${userId}${id}`, response, {
        // save to redis for 4 hours
        ttl: REDIS_CACHE_TTL / 6
      });

      return response;
    } catch (error) {
      this.logger.error(
        'error get detail userProduct through db',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async create(dto: UserProductCreateRequest): Promise<any> {
    try {
      this.logger.log(
        'starting create userProduct through BullMQ',
        '===running==='
      );

      let createUserProductResponse;
      const job = await this.userProductQueue.add('addUserProductQueue', dto);
      // eslint-disable-next-line prefer-const
      createUserProductResponse = await job.finished();
      this.logger.log(
        'success add userProduct to db',
        JSON.stringify(dto, null, 2)
      );

      return {
        statusCode: 201,
        statusDescription: 'Create userProduct success!',
        data: createUserProductResponse
      };
    } catch (error) {
      this.logger.error(
        'error create userProduct through BullMQ',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async update(dto: UserProductUpdateRequest): Promise<any> {
    const { id } = dto;
    try {
      this.logger.log(
        'starting update userProduct through BullMQ',
        '===running==='
      );

      const findUserProduct = await UserProduct.findByPk(id);

      if (!findUserProduct) {
        this.logger.error(
          '===== Error while find userProduct by id on update =====',
          `Error: `,
          'ID klaim tidak ditemukan'
        );
        throw new NotFoundException(
          'ID klaim tidak ditemukan, Mohon periksa kembali.'
        );
      }

      const job = await this.userProductQueue.add(
        'updateUserProductQueue',
        dto
      );

      const response = await job.finished();

      this.logger.log(
        'success update userProduct to db',
        JSON.stringify(dto, null, 2)
      );

      return {
        statusCode: 201,
        statusDescription: 'Update userProduct success!',
        data: response
      };
    } catch (error) {
      this.logger.error(
        'error update userProduct through BullMQ',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async delete(deletedBy: string, id: string): Promise<any> {
    const transaction = await this.sequelize.transaction();

    try {
      this.logger.log('starting delete user product', '===running===');

      const userProduct = await this.userProductRepository.findByPk(id);

      if (!userProduct) {
        this.logger.error(
          '===== Error userProduct by id =====',
          `Error: `,
          'ID user product tidak ditemukan.'
        );
        throw new NotFoundException(
          'ID user product tidak ditemukan, Mohon periksa kembali.'
        );
      }

      await userProduct.update(
        { deletedBy },
        {
          transaction
        }
      );

      const response = await this.userProductRepository.destroy({
        where: { id },
        transaction
      });

      await transaction.commit();

      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`userProductData${deletedBy}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'success delete userProduct',
        JSON.stringify(response, null, 2)
      );

      return {
        statusCode: 201,
        statusDescription: 'Berhasil menghapus user product.'
      };
    } catch (error) {
      this.logger.error(
        'error delete userProduct',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      await transaction.rollback();
      throw new Error(error.message);
    }
  }
}
