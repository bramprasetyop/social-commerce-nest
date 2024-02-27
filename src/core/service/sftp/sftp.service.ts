import { Injectable } from '@nestjs/common';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { Client } from 'ssh2';

@Injectable()
export class SftpService {
  private readonly host: string;
  private readonly port: number;
  private readonly username: string;
  private readonly password: string;

  constructor(private readonly logger: LoggerService) {
    this.host = process.env.SFTP_HOST;

    this.port = parseInt(process.env.SFTP_PORT || '22', 10);
    this.username = process.env.SFTP_USERNAME;
    this.password = process.env.SFTP_PASSWORD;
  }

  async sftpClient() {
    const client = new Client();

    const credentials = {
      host: this.host,
      port: this.port,
      username: this.username,
      password: this.password
    };

    await client.connect(credentials).catch(error => {
      this.logger.error(
        'SFTP client error connection',
        'Error',
        JSON.stringify(error, null, 2)
      );

      throw error;
    });

    return client;
  }
}
