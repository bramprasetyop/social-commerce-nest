import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HttpHealthIndicator
} from '@nestjs/terminus';

@Injectable()
export class EliOpenAPIHealthIndicator extends HealthIndicator {
  private readonly http: HttpHealthIndicator;

  constructor(http: HttpHealthIndicator) {
    super();
    this.http = http;
  }

  async isHealthy(url: string): Promise<HealthIndicatorResult> {
    try {
      await this.http.pingCheck('ELI Open API', `${url}`);
      return this.getStatus('ELI Open API', true);
    } catch (error) {
      return this.getStatus('ELI Open API', false, { message: error.message });
    }
  }
}
