import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { GENERATE_LINK_REPOSITORY, REDIS_CACHE_TTL } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import axios from 'axios';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';
import * as dotenv from 'dotenv';

import { GenerateLinkCreateRequest } from '../dto';
import { GenerateLink } from '../entity/generateLink.entity';
import { PagingGenerateLink } from './generateLinks.interface';

dotenv.config();

@Injectable()
export class GenerateLinkService {
  private readonly openApiUrl = process.env.OPEN_API_URL;
  sequelize: any;
  constructor(
    @Inject(GENERATE_LINK_REPOSITORY)
    private readonly generateLinkRepository: typeof GenerateLink,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(CACHE_MANAGER) private cacheStoreService: CacheStore,
    @InjectQueue('generateLinkQueue') private generateLinkQueue: Queue
  ) {
    this.sequelize = this.generateLinkRepository.sequelize;
  }
  async findAll(
    userId: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<PagingGenerateLink> {
    try {
      const currentPage = page && page >= 1 ? page : 1;

      this.logger.log(
        'starting get all generate links through existing cached',
        '===running==='
      );

      // Calculate the offset based on the page and perpage values
      const offset = (currentPage - 1) * perPage;

      // get generate links from redis
      const cachedData = await this.cacheService.get<any>(
        `generateLinkData${userId}${currentPage}${perPage}`
      );

      if (cachedData) {
        this.logger.log(
          'response get all generate link through existing cached',
          'success'
        );
        return cachedData;
      }

      this.logger.log(
        'starting get all generate links through db',
        '===running==='
      );

      const response = await this.generateLinkRepository.findAndCountAll({
        limit: perPage,
        offset,
        order: [['updatedAt', 'DESC']]
      });

      this.logger.log(
        'success get all generate links through db',
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

      // save generate links to redis
      this.cacheStoreService.set(
        `generateLinkData${userId}${currentPage}${perPage}`,
        result,
        // save to redis for 4 hours
        { ttl: REDIS_CACHE_TTL / 6 }
      );

      return result;
    } catch (error) {
      this.logger.error(
        'error get all generate links through db',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async findById(userId: string, id: string): Promise<GenerateLink> {
    try {
      this.logger.log(
        'starting get detail generate link through existing cached',
        '===running==='
      );
      // get generate link detail from redis
      const cachedData = await this.cacheService.get<GenerateLink>(
        `generateLinkData${userId}${id}`
      );

      if (cachedData) {
        this.logger.log(
          'response get detail generate link through existing cached',
          'success'
        );
        return cachedData;
      }

      this.logger.log(
        'starting get detail generate link through db',
        '===running==='
      );

      const response = await this.generateLinkRepository.findByPk(id);

      if (!response) {
        this.logger.error(
          '===== Error while find generate link by id on find by id =====',
          `Error: `,
          'ID klaim tidak ditemukan'
        );
        throw new NotFoundException(
          'ID klaim tidak ditemukan, Mohon periksa kembali.'
        );
      }

      this.logger.log(
        'success get detail generate link through db',
        JSON.stringify(response, null, 2)
      );

      // save generate link detail to redis
      this.cacheStoreService.set(`generateLinkData${userId}${id}`, response, {
        // save to redis for 4 hours
        ttl: REDIS_CACHE_TTL / 6
      });

      return response;
    } catch (error) {
      this.logger.error(
        'error get detail generate link through db',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async create(headers: any, dto: GenerateLinkCreateRequest): Promise<any> {
    try {
      this.logger.log(
        'starting create generate link through BullMQ',
        '===running==='
      );

      const { clientId, relativeUrl, accessToken, signature, timestamp } =
        headers;

      try {
        await axios.post(`${this.openApiUrl}verify-symmetric-signature`, dto, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-TIMESTAMP': timestamp,
            'X-CLIENT-ID': clientId,
            'X-SIGNATURE': signature,
            'X-URL': relativeUrl
          }
        });
      } catch (error) {
        this.logger.error(
          'error verify symmetric signature',
          'error ===>',
          JSON.stringify(error, null, 2)
        );
        if (error?.response?.data?.status_code === 400) {
          throw new BadRequestException(
            error?.response?.data?.status_description
          );
        }
        if (error?.response?.data?.status_code === 401) {
          throw new UnauthorizedException(
            error?.response?.data?.status_description
          );
        }
        throw new Error(error?.response?.data?.status_description);
      }

      const job = await this.generateLinkQueue.add('addGenerateLinkQueue', {
        ...dto,
        ...{ createdBy: dto?.partnerUserId }
      });
      const createGenerateLinkResponse = await job.finished();
      this.logger.log(
        'success add generate link to db',
        JSON.stringify(dto, null, 2)
      );

      return {
        statusCode: 201,
        statusDescription: 'Create generate link success!',
        data: {
          accessUrl: `https://eli-white-label.com?token=${createGenerateLinkResponse?.link}`
        }
      };
    } catch (error) {
      this.logger.error(
        'error create generate link through BullMQ',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async delete(dto: any): Promise<any> {
    const transaction = await this.sequelize.transaction();

    try {
      const { id, deletedBy } = dto;
      this.logger.log('starting delete generate link', '===running===');

      const link = await this.generateLinkRepository.findByPk(id);

      if (!link) {
        this.logger.error(
          '===== Error link by id =====',
          `Error: `,
          'ID link tidak ditemukan.'
        );
        throw new NotFoundException(
          'ID link tidak ditemukan, Mohon periksa kembali.'
        );
      }

      await link.update(
        { deletedBy },
        {
          transaction
        }
      );

      const response = await this.generateLinkRepository.destroy({
        where: { id },
        transaction
      });

      await transaction.commit();

      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`generateLinkData${deletedBy}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log('success delete link', JSON.stringify(response, null, 2));

      return {
        statusCode: 201,
        statusDescription: 'Berhasil menghapus link.'
      };
    } catch (error) {
      this.logger.error(
        'error delete link',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      await transaction.rollback();
      throw new Error(error.message);
    }
  }
}
