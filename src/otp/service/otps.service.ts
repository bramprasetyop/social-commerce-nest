import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OTP_REPOSITORY, REDIS_CACHE_TTL } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';
import * as dotenv from 'dotenv';

import { OtpCreateRequest, OtpUpdateRequest } from '../dto';
import { OTP } from '../entity/otp.entity';
import { PagingOtp } from './otps.interface';

dotenv.config();

@Injectable()
export class OtpsService {
  private readonly host: string;
  sequelize: any;
  constructor(
    @Inject(OTP_REPOSITORY)
    private readonly otpRepository: typeof OTP,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(CACHE_MANAGER) private cacheStoreService: CacheStore,
    @InjectQueue('otpQueue') private otpQueue: Queue
  ) {
    this.sequelize = this.otpRepository.sequelize;
  }
  async findAll(
    userId: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<PagingOtp> {
    try {
      const currentPage = page && page >= 1 ? page : 1;

      this.logger.log(
        'starting get all otps through existing cached',
        '===running==='
      );

      // Calculate the offset based on the page and perpage values
      const offset = (currentPage - 1) * perPage;

      // get otps from redis
      const cachedData = await this.cacheService.get<any>(
        `otpData${userId}${currentPage}${perPage}`
      );

      if (cachedData) {
        this.logger.log(
          'response get all otp document through existing cached',
          'success'
        );
        return cachedData;
      }

      this.logger.log('starting get all otps through db', '===running===');

      const response = await this.otpRepository.findAndCountAll({
        limit: perPage,
        offset,
        order: [['updatedAt', 'DESC']]
      });

      this.logger.log(
        'success get all otps through db',
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

      // save otps to redis
      this.cacheStoreService.set(
        `otpData${userId}${currentPage}${perPage}`,
        result,
        // save to redis for 4 hours
        { ttl: REDIS_CACHE_TTL / 6 }
      );

      return result;
    } catch (error) {
      this.logger.error(
        'error get all otps through db',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async findById(userId: string, id: number): Promise<OTP> {
    try {
      this.logger.log(
        'starting get detail otp through existing cached',
        '===running==='
      );
      // get otp detail from redis
      const cachedData = await this.cacheService.get<OTP>(
        `otpData${userId}${id}`
      );

      if (cachedData) {
        this.logger.log(
          'response get detail otp through existing cached',
          'success'
        );
        return cachedData;
      }

      this.logger.log('starting get detail otp through db', '===running===');

      const response = await this.otpRepository.findOne({
        where: {
          id
        }
      });

      if (!response) {
        this.logger.error(
          '===== Error while find otp by id on find by id =====',
          `Error: `,
          'ID klaim tidak ditemukan'
        );
        throw new NotFoundException(
          'ID klaim tidak ditemukan, Mohon periksa kembali.'
        );
      }

      this.logger.log(
        'success get detail otp through db',
        JSON.stringify(response, null, 2)
      );

      // save otp detail to redis
      this.cacheStoreService.set(`otpData${userId}${id}`, response, {
        // save to redis for 4 hours
        ttl: REDIS_CACHE_TTL / 6
      });

      return response;
    } catch (error) {
      this.logger.error(
        'error get detail otp through db',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async create(dto: OtpCreateRequest): Promise<any> {
    try {
      this.logger.log('starting create otp through BullMQ', '===running===');

      let createOtpResponse;
      const job = await this.otpQueue.add('addOtpQueue', dto);
      // eslint-disable-next-line prefer-const
      createOtpResponse = await job.finished();
      this.logger.log('success add otp to db', JSON.stringify(dto, null, 2));

      return {
        statusCode: 201,
        statusDescription: 'Create otp success!',
        data: createOtpResponse
      };
    } catch (error) {
      this.logger.error(
        'error create otp through BullMQ',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async update(dto: OtpUpdateRequest): Promise<any> {
    const { id } = dto;
    try {
      this.logger.log('starting update otp through BullMQ', '===running===');

      const findOtp = await OTP.findByPk(id);

      if (!findOtp) {
        this.logger.error(
          '===== Error while find otp by id on update =====',
          `Error: `,
          'ID klaim tidak ditemukan'
        );
        throw new NotFoundException(
          'ID klaim tidak ditemukan, Mohon periksa kembali.'
        );
      }

      const job = await this.otpQueue.add('updateOtpQueue', dto);

      const response = await job.finished();

      this.logger.log('success update otp to db', JSON.stringify(dto, null, 2));

      return {
        statusCode: 201,
        statusDescription: 'Update otp success!',
        data: response
      };
    } catch (error) {
      this.logger.error(
        'error update otp through BullMQ',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }

  async delete(userId: string, id: string): Promise<any> {
    try {
      this.logger.log('starting delete otp', '===running===');

      const response = await this.otpRepository.destroy({
        where: { id }
      });

      if (!response) {
        this.logger.error(
          '===== Error otp by id =====',
          `Error: `,
          'ID OTP tidak ditemukan.'
        );
        throw new NotFoundException(
          'ID OTP tidak ditemukan, Mohon periksa kembali.'
        );
      }

      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`otpData${userId}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log('success delete otp', JSON.stringify(response, null, 2));

      return {
        statusCode: 201,
        statusDescription: 'Berhasil menghapus OTP.'
      };
    } catch (error) {
      this.logger.error(
        'error delete otp',
        'error ===>',
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }
  }
}
