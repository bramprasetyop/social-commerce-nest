import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private readonly redisClient: Redis;

  constructor() {
    super();
    // Update connection details if needed
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379
    });
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this.redisClient.ping();
      return this.getStatus('redis', true);
    } catch (error) {
      return this.getStatus('redis', false, { message: error.message });
    }
  }
}
