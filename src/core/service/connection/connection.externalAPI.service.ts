import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HttpHealthIndicator
} from '@nestjs/terminus';

@Injectable()
export class ExternalAPIHealthIndicator extends HealthIndicator {
  private readonly http: HttpHealthIndicator;

  constructor(http: HttpHealthIndicator) {
    super();
    this.http = http;
  }

  async isHealthy(url: string): Promise<HealthIndicatorResult> {
    try {
      await this.http.pingCheck('external API', `${url}`);
      return this.getStatus('external API', true);
    } catch (error) {
      return this.getStatus('external API', false, { message: error.message });
    }
  }
}
