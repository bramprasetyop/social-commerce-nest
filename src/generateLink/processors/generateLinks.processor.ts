import { Process, Processor } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, UnauthorizedException } from '@nestjs/common';
import {
  GENERATE_LINK_REPOSITORY,
  USERS_REPOSITORY
} from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { PartnerUser } from '@src/partnerUsers/entity/partnerUser.entity';
import { Partner } from '@src/partners/entity/partner.entity';
import { User } from '@src/users/entity/user.entity';
import { Job } from 'bull';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import * as moment from 'moment-timezone';

import { GenerateLinkCreateRequest } from '../dto';
import { GenerateLink } from '../entity/generateLink.entity';

@Processor('generateLinkQueue')
export class GenerateLinkProcessor {
  constructor(
    @Inject(GENERATE_LINK_REPOSITORY)
    private readonly generateLinkRepository: typeof GenerateLink,
    @Inject(USERS_REPOSITORY)
    private readonly userRepository: typeof User,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache
  ) {}

  private getExcludedAttributes(): { exclude: string[] } {
    return {
      exclude: [
        'createdAt',
        'createdBy',
        'updatedAt',
        'updatedBy',
        'deletedAt',
        'deletedBy'
      ]
    };
  }

  private async encrypt(data: any, key: string): Promise<any> {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  }

  private async decrypt(encryptedData: string, key: string): Promise<any> {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  @Process('addGenerateLinkQueue')
  async processAddGenerateLink(job: Job<GenerateLinkCreateRequest>) {
    const generateLinkData = job.data;
    const { createdBy } = generateLinkData;

    const t = await this.generateLinkRepository.sequelize.transaction();

    try {
      this.logger.log(
        'Starting add generate link in bull processor',
        '===running==='
      );

      const createdUser = await this.userRepository.create<User>(
        generateLinkData,
        {
          transaction: t
        }
      );

      const link = await this.encrypt(createdUser?.id, 'key');

      const expired = moment().add(24, 'hours').tz('Asia/Bangkok').toDate();

      const createdGenerateLink =
        await this.generateLinkRepository.create<GenerateLink>(
          {
            ...generateLinkData,
            ...{ userId: createdUser?.id, link, expired }
          },
          {
            transaction: t
          }
        );

      await t.commit();
      const keys = await this.cacheService.store.keys();
      const keysToDelete = keys.filter(key =>
        key.startsWith(`generateLinkData${createdBy}`)
      );

      for (const keyToDelete of keysToDelete) {
        await this.cacheService.del(keyToDelete);
      }

      this.logger.log(
        'Add generate link in bull processor done',
        JSON.stringify(createdGenerateLink, null, 2)
      );
      return createdGenerateLink;
    } catch (error) {
      this.logger.error(
        'Add generate link in bull processor',
        'Error',
        JSON.stringify(error, null, 2)
      );
      await t.rollback();
      throw error;
    }
  }

  @Process('verifyLinkQueue')
  async processVerifyLinkQueue(job: Job<string>) {
    const token = job.data;

    try {
      this.logger.log(
        'Starting verify link in bull processor',
        '===running==='
      );

      const userId = await this.decrypt(token, 'key');

      const user = await this.generateLinkRepository.findOne({
        where: {
          userId,
          isActive: true
        },
        include: [
          { model: User, as: 'user', attributes: this.getExcludedAttributes() },
          {
            model: Partner,
            as: 'partner',
            attributes: this.getExcludedAttributes()
          },
          {
            model: PartnerUser,
            as: 'partnerUser',
            attributes: this.getExcludedAttributes()
          }
        ],
        attributes: ['link']
      });

      if (!user) {
        throw new UnauthorizedException('Invalid link or expired');
      }

      this.logger.log(
        'Verify link in bull processor done',
        JSON.stringify(user, null, 2)
      );
      return user;
    } catch (error) {
      this.logger.error(
        'Verify link in bull processor',
        'Error',
        JSON.stringify(error, null, 2)
      );
      throw error;
    }
  }
}
