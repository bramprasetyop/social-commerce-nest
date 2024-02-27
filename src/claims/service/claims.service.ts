import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLAIMS_REPOSITORY, REDIS_CACHE_TTL } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';
import * as dotenv from 'dotenv';

import { ClaimCreateRequest, ClaimUpdateRequest } from '../dto';
import { Claim } from '../entity/claim.entity';
import { PagingClaim } from './claims.interface';

dotenv.config();

@Injectable()
export class ClaimsService {
  private readonly host: string;
  sequelize: any;
  constructor(
    @Inject(CLAIMS_REPOSITORY)
    private readonly claimRepository: typeof Claim,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(CACHE_MANAGER) private cacheStoreService: CacheStore,
    @InjectQueue('claimQueue') private claimQueue: Queue
  ) {
    this.sequelize = this.claimRepository.sequelize;
  }
  async findAll(
    userId: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<PagingClaim> {
    try {
      const currentPage = page && page >= 1 ? page : 1;

      this.logger.log(
        'starting get all claims through existing cached',
        '===running==='
      );

      // Calculate the offset based on the page and perpage values
      const offset = (currentPage - 1) * perPage;

      // get claims from redis
      const cachedData = await this.cacheService.get<any>(
        `claimData${userId}${currentPage}${perPage}`
      );

      if (cachedData) {
        this.logger.log(
          'response get all claim document through existing cached',
          'success'
        );
        return cachedData;
      }

      this.logger.log('starting get all claims through db', '===running===');

      const response = await this.claimRepository.findAndCountAll({
        limit: perPage,
        offset,
        order: [['updatedAt', 'DESC']]
      });

      this.logger.log(
        'success get all claims through db',
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

      // save claims to redis
      this.cacheStoreService.set(
        `claimData${userId}${currentPage}${perPage}`,
        result,
        // save to redis for 4 hours
        { ttl: REDIS_CACHE_TTL / 6 }
      );

      return result;
    } catch (error) {
      this.logger.error(
        'error get all claims through db',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async findById(userId: string, id: number): Promise<Claim> {
    try {
      this.logger.log(
        'starting get detail claim through existing cached',
        '===running==='
      );
      // get claim detail from redis
      const cachedData = await this.cacheService.get<Claim>(
        `claimData${userId}${id}`
      );

      if (cachedData) {
        this.logger.log(
          'response get detail claim through existing cached',
          'success'
        );
        return cachedData;
      }

      this.logger.log('starting get detail claim through db', '===running===');

      const response = await this.claimRepository.findOne({
        where: {
          id
        }
      });

      if (!response) {
        this.logger.error(
          '===== Error while find claim by id on find by id =====',
          `Error: `,
          'ID klaim tidak ditemukan'
        );
        throw new NotFoundException(
          'ID klaim tidak ditemukan, Mohon periksa kembali.'
        );
      }

      this.logger.log(
        'success get detail claim through db',
        JSON.stringify(response, null, 2)
      );

      // save claim detail to redis
      this.cacheStoreService.set(`claimData${userId}${id}`, response, {
        // save to redis for 4 hours
        ttl: REDIS_CACHE_TTL / 6
      });

      return response;
    } catch (error) {
      this.logger.error(
        'error get detail claim through db',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async create(dto: ClaimCreateRequest): Promise<any> {
    try {
      this.logger.log('starting create claim through BullMQ', '===running===');

      let createClaimResponse;
      const job = await this.claimQueue.add('addClaimQueue', dto);
      // eslint-disable-next-line prefer-const
      createClaimResponse = await job.finished();
      this.logger.log('success add claim to db', JSON.stringify(dto, null, 2));

      return {
        statusCode: 201,
        statusDescription: 'Create claim success!',
        data: createClaimResponse
      };
    } catch (error) {
      this.logger.error(
        'error create claim through BullMQ',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async update(dto: ClaimUpdateRequest): Promise<any> {
    const { id } = dto;
    try {
      this.logger.log('starting update claim through BullMQ', '===running===');

      const findClaim = await Claim.findByPk(id);

      if (!findClaim) {
        this.logger.error(
          '===== Error while find claim by id on update =====',
          `Error: `,
          'ID klaim tidak ditemukan'
        );
        throw new NotFoundException(
          'ID klaim tidak ditemukan, Mohon periksa kembali.'
        );
      }

      const job = await this.claimQueue.add('updateClaimQueue', dto);

      const response = await job.finished();

      this.logger.log(
        'success update claim to db',
        JSON.stringify(dto, null, 2)
      );

      return {
        statusCode: 201,
        statusDescription: 'Update claim success!',
        data: response
      };
    } catch (error) {
      this.logger.error(
        'error update claim through BullMQ',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async delete(userId: string, id: string): Promise<any> {
    try {
      this.logger.log('starting delete claim', '===running===');

      const response = await this.claimRepository.destroy({
        where: { id }
      });

      if (!response) {
        this.logger.error(
          '===== Error claim by id =====',
          `Error: `,
          'ID Claim tidak ditemukan.'
        );
        throw new NotFoundException(
          'ID Claim tidak ditemukan, Mohon periksa kembali.'
        );
      }

      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`claimData${userId}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'success delete claim',
        JSON.stringify(response, null, 2)
      );

      return {
        statusCode: 201,
        statusDescription: 'Berhasil menghapus Claim.'
      };
    } catch (error) {
      this.logger.error(
        'error delete claim',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }
}
