import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';

@Injectable()
export class LinksCronService {
  constructor(@InjectQueue('linkCronQueue') private linkCronQueue: Queue) {}

  @Cron('1 0 * * *') // Run at 12:01 AM every day
  async linkCron(): Promise<any> {
    await this.linkCronQueue.add('getLinkCronQueue', {}, { attempts: 3 });
  }
}
