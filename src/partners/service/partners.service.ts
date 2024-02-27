import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PARTNERS_REPOSITORY, REDIS_CACHE_TTL } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';
import * as dotenv from 'dotenv';

import { PartnerCreateRequest, PartnerUpdateRequest } from '../dto';
import { Partner } from '../entity/partner.entity';
import { PagingPartner } from './partners.interface';

dotenv.config();

@Injectable()
export class PartnersService {
  private readonly host: string;
  sequelize: any;
  constructor(
    @Inject(PARTNERS_REPOSITORY)
    private readonly partnerRepository: typeof Partner,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(CACHE_MANAGER) private cacheStoreService: CacheStore,
    @InjectQueue('partnerQueue') private partnerQueue: Queue
  ) {
    this.sequelize = this.partnerRepository.sequelize;
  }
  async findAll(
    userId: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<PagingPartner> {
    try {
      const currentPage = page && page >= 1 ? page : 1;

      this.logger.log(
        'starting get all partners through existing cached',
        '===running==='
      );

      // Calculate the offset based on the page and perpage values
      const offset = (currentPage - 1) * perPage;

      // get partners from redis
      const cachedData = await this.cacheService.get<any>(
        `partnerData${userId}${currentPage}${perPage}`
      );

      if (cachedData) {
        this.logger.log(
          'response get all partner document through existing cached',
          'success'
        );
        return cachedData;
      }

      this.logger.log('starting get all partners through db', '===running===');

      const response = await this.partnerRepository.findAndCountAll({
        limit: perPage,
        offset,
        order: [['updatedAt', 'DESC']]
      });

      this.logger.log(
        'success get all partners through db',
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

      // save partners to redis
      this.cacheStoreService.set(
        `partnerData${userId}${currentPage}${perPage}`,
        result,
        // save to redis for 4 hours
        { ttl: REDIS_CACHE_TTL / 6 }
      );

      return result;
    } catch (error) {
      this.logger.error(
        'error get all partners through db',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async findById(userId: string, id: number): Promise<Partner> {
    try {
      this.logger.log(
        'starting get detail partner through existing cached',
        '===running==='
      );
      // get partner detail from redis
      const cachedData = await this.cacheService.get<Partner>(
        `partnerData${userId}${id}`
      );

      if (cachedData) {
        this.logger.log(
          'response get detail partner through existing cached',
          'success'
        );
        return cachedData;
      }

      this.logger.log(
        'starting get detail partner through db',
        '===running==='
      );

      const response = await this.partnerRepository.findOne({
        where: {
          id
        }
      });

      if (!response) {
        this.logger.error(
          '===== Error while find partner by id on find by id =====',
          `Error: `,
          'ID klaim tidak ditemukan'
        );
        throw new NotFoundException(
          'ID klaim tidak ditemukan, Mohon periksa kembali.'
        );
      }

      this.logger.log(
        'success get detail partner through db',
        JSON.stringify(response, null, 2)
      );

      // save partner detail to redis
      this.cacheStoreService.set(`partnerData${userId}${id}`, response, {
        // save to redis for 4 hours
        ttl: REDIS_CACHE_TTL / 6
      });

      return response;
    } catch (error) {
      this.logger.error(
        'error get detail partner through db',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async create(dto: PartnerCreateRequest): Promise<any> {
    try {
      this.logger.log(
        'starting create partner through BullMQ',
        '===running==='
      );

      let createPartnerResponse;
      const job = await this.partnerQueue.add('addPartnerQueue', dto);
      // eslint-disable-next-line prefer-const
      createPartnerResponse = await job.finished();
      this.logger.log(
        'success add partner to db',
        JSON.stringify(dto, null, 2)
      );

      return {
        statusCode: 201,
        statusDescription: 'Create partner success!',
        data: createPartnerResponse
      };
    } catch (error) {
      this.logger.error(
        'error create partner through BullMQ',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async update(dto: PartnerUpdateRequest): Promise<any> {
    const { id } = dto;
    try {
      this.logger.log(
        'starting update partner through BullMQ',
        '===running==='
      );

      const findPartner = await Partner.findByPk(id);

      if (!findPartner) {
        this.logger.error(
          '===== Error while find partner by id on update =====',
          `Error: `,
          'ID klaim tidak ditemukan'
        );
        throw new NotFoundException(
          'ID klaim tidak ditemukan, Mohon periksa kembali.'
        );
      }

      const job = await this.partnerQueue.add('updatePartnerQueue', dto);

      const response = await job.finished();

      this.logger.log(
        'success update partner to db',
        JSON.stringify(dto, null, 2)
      );

      return {
        statusCode: 201,
        statusDescription: 'Update partner success!',
        data: response
      };
    } catch (error) {
      this.logger.error(
        'error update partner through BullMQ',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async delete(userId: string, id: string): Promise<any> {
    try {
      this.logger.log('starting delete partner', '===running===');

      const response = await this.partnerRepository.destroy({
        where: { id }
      });

      if (!response) {
        this.logger.error(
          '===== Error partner by id =====',
          `Error: `,
          'ID Partner tidak ditemukan.'
        );
        throw new NotFoundException(
          'ID Partner tidak ditemukan, Mohon periksa kembali.'
        );
      }

      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`partnerData${userId}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'success delete partner',
        JSON.stringify(response, null, 2)
      );

      return {
        statusCode: 201,
        statusDescription: 'Berhasil menghapus Partner.'
      };
    } catch (error) {
      this.logger.error(
        'error delete partner',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }
}
