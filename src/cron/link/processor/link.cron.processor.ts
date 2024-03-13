import { Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { GENERATE_LINK_REPOSITORY } from '@src/core/constants';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { GenerateLink } from '@src/generateLink/entity/generateLink.entity';
import * as moment from 'moment-timezone';
import { Op } from 'sequelize';

@Processor('linkCronQueue')
export class LinkCronProcessor {
  constructor(
    private readonly logger: LoggerService,
    @Inject(GENERATE_LINK_REPOSITORY)
    private readonly generateLinkRepository: typeof GenerateLink
  ) {}

  @Process('getLinkCronQueue')
  async processGetLink() {
    const transaction =
      await this.generateLinkRepository.sequelize.transaction();

    try {
      this.logger.log(
        'starting run cron get draft link in bull processor',
        '===running==='
      );

      const currentDate = moment().tz('Asia/Bangkok');

      const expiredLinks = await this.generateLinkRepository.findAll({
        where: {
          isActive: true,
          expired: {
            [Op.lt]: currentDate.toDate()
          }
        }
      });

      await Promise.all(
        expiredLinks.map(link =>
          link.update({ isActive: false, updatedBy: 'SYS' }, { transaction })
        )
      );

      await transaction.commit();

      this.logger.log(
        'run cron get link in bull processor done',
        '======finish======'
      );
      return true;
    } catch (error) {
      await transaction.rollback();
      this.logger.error(
        'run cron get link in bull processor',
        'error',
        JSON.stringify(error, null, 2)
      );
    }
  }
}
