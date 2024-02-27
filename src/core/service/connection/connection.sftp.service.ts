import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import * as Client from 'ssh2-sftp-client';

@Injectable()
export class SftpHealthIndicator extends HealthIndicator {
  private readonly host: string;
  private readonly port: number;
  private readonly username: string;
  private readonly password: string;

  constructor() {
    super();
    this.host = process.env.SFTP_HOST;
    this.port = Number(process.env.SFTP_PORT) || 22;
    this.username = process.env.SFTP_USERNAME;
    this.password = process.env.SFTP_PASSWORD;
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      const client = await this.sftpClient();
      // Close the connection after successful health check
      await client.end();
      return this.getStatus('sftp', true);
    } catch (error) {
      return this.getStatus('sftp', false, { message: error.message });
    }
  }

  private async sftpClient(): Promise<Client> {
    const client = new Client();
    const credentials = {
      host: this.host,
      port: this.port,
      username: this.username,
      password: this.password
    };

    try {
      await client.connect(credentials);
      return client;
    } catch (error) {
      throw error;
    }
  }
}
