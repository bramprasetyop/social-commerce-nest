import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PARTNER_USERS_REPOSITORY, REDIS_CACHE_TTL } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';
import * as dotenv from 'dotenv';

import { PartnerUserCreateRequest, PartnerUserUpdateRequest } from '../dto';
import { PartnerUser } from '../entity/partnerUser.entity';
import { PagingPartnerUser } from './partnerUsers.interface';

dotenv.config();

@Injectable()
export class PartnerUsersService {
  private readonly host: string;
  sequelize: any;
  constructor(
    @Inject(PARTNER_USERS_REPOSITORY)
    private readonly partnerUserRepository: typeof PartnerUser,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(CACHE_MANAGER) private cacheStoreService: CacheStore,
    @InjectQueue('partnerUserQueue') private partnerUserQueue: Queue
  ) {
    this.sequelize = this.partnerUserRepository.sequelize;
  }
  async findAll(
    userId: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<PagingPartnerUser> {
    try {
      const currentPage = page && page >= 1 ? page : 1;

      this.logger.log(
        'starting get all partnerUsers through existing cached',
        '===running==='
      );

      // Calculate the offset based on the page and perpage values
      const offset = (currentPage - 1) * perPage;

      // get partnerUsers from redis
      const cachedData = await this.cacheService.get<any>(
        `partnerUserData${userId}${currentPage}${perPage}`
      );

      if (cachedData) {
        this.logger.log(
          'response get all partnerUser document through existing cached',
          'success'
        );
        return cachedData;
      }

      this.logger.log(
        'starting get all partnerUsers through db',
        '===running==='
      );

      const response = await this.partnerUserRepository.findAndCountAll({
        limit: perPage,
        offset,
        order: [['updatedAt', 'DESC']]
      });

      this.logger.log(
        'success get all partnerUsers through db',
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

      // save partnerUsers to redis
      this.cacheStoreService.set(
        `partnerUserData${userId}${currentPage}${perPage}`,
        result,
        // save to redis for 4 hours
        { ttl: REDIS_CACHE_TTL / 6 }
      );

      return result;
    } catch (error) {
      this.logger.error(
        'error get all partnerUsers through db',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async findById(userId: string, id: string): Promise<PartnerUser> {
    try {
      this.logger.log(
        'starting get detail partnerUser through existing cached',
        '===running==='
      );
      // get partnerUser detail from redis
      const cachedData = await this.cacheService.get<PartnerUser>(
        `partnerUserData${userId}${id}`
      );

      if (cachedData) {
        this.logger.log(
          'response get detail partnerUser through existing cached',
          'success'
        );
        return cachedData;
      }

      this.logger.log(
        'starting get detail partnerUser through db',
        '===running==='
      );

      const response = await this.partnerUserRepository.findByPk(id);

      if (!response) {
        this.logger.error(
          '===== Error while find partnerUser by id on find by id =====',
          `Error: `,
          'ID klaim tidak ditemukan'
        );
        throw new NotFoundException(
          'ID klaim tidak ditemukan, Mohon periksa kembali.'
        );
      }

      this.logger.log(
        'success get detail partnerUser through db',
        JSON.stringify(response, null, 2)
      );

      // save partnerUser detail to redis
      this.cacheStoreService.set(`partnerUserData${userId}${id}`, response, {
        // save to redis for 4 hours
        ttl: REDIS_CACHE_TTL / 6
      });

      return response;
    } catch (error) {
      this.logger.error(
        'error get detail partnerUser through db',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async create(dto: PartnerUserCreateRequest): Promise<any> {
    try {
      this.logger.log(
        'starting create partnerUser through BullMQ',
        '===running==='
      );

      const job = await this.partnerUserQueue.add('addPartnerUserQueue', dto);
      const createPartnerUserResponse = await job.finished();
      this.logger.log(
        'success add partnerUser to db',
        JSON.stringify(dto, null, 2)
      );

      return {
        statusCode: 201,
        statusDescription: 'Create partner user success!',
        data: createPartnerUserResponse
      };
    } catch (error) {
      this.logger.error(
        'error create partnerUser through BullMQ',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async update(dto: PartnerUserUpdateRequest): Promise<any> {
    const { id } = dto;
    try {
      this.logger.log(
        'starting update partnerUser through BullMQ',
        '===running==='
      );

      const findPartnerUser = await PartnerUser.findByPk(id);

      if (!findPartnerUser) {
        this.logger.error(
          '===== Error while find partnerUser by id on update =====',
          `Error: `,
          'ID klaim tidak ditemukan'
        );
        throw new NotFoundException(
          'ID klaim tidak ditemukan, Mohon periksa kembali.'
        );
      }

      const job = await this.partnerUserQueue.add(
        'updatePartnerUserQueue',
        dto
      );

      const response = await job.finished();

      this.logger.log(
        'success update partnerUser to db',
        JSON.stringify(dto, null, 2)
      );

      return {
        statusCode: 201,
        statusDescription: 'Update partnerUser success!',
        data: response
      };
    } catch (error) {
      this.logger.error(
        'error update partnerUser through BullMQ',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async delete(deletedBy: string, id: string): Promise<any> {
    const transaction = await this.sequelize.transaction();

    try {
      this.logger.log('starting delete partnerUser', '===running===');

      const partnerUser = await this.partnerUserRepository.findByPk(id);

      if (!partnerUser) {
        this.logger.error(
          '===== Error partnerUser by id =====',
          `Error: `,
          'ID partnerUser tidak ditemukan.'
        );
        throw new NotFoundException(
          'ID partnerUser tidak ditemukan, Mohon periksa kembali.'
        );
      }

      await partnerUser.update(
        { deletedBy },
        {
          transaction
        }
      );

      const response = await this.partnerUserRepository.destroy({
        where: { id },
        transaction
      });

      await transaction.commit();

      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`partnerUserData${deletedBy}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'success delete partnerUser',
        JSON.stringify(response, null, 2)
      );

      return {
        statusCode: 201,
        statusDescription: 'Berhasil menghapus PartnerUser.'
      };
    } catch (error) {
      this.logger.error(
        'error delete partnerUser',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      await transaction.rollback();
      throw new Error(error.message);
    }
  }
}
