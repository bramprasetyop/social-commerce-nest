import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';

@Injectable()
export class ClaimsCronService {
  constructor(@InjectQueue('claimCronQueue') private claimCronQueue: Queue) {}

  // @Cron('1 0 * * *') // Run at 12:01 AM every day
  async claimCron(): Promise<any> {
    await this.claimCronQueue.add('getClaimCronQueue', { isSchedule: true });
  }
}
