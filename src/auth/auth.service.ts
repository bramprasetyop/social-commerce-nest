import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '@src/core/service/logger/logger.service';
import axios from 'axios';

import { LoginDto, LoginResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private cacheService: CacheStore
  ) {}

  async login(payload: LoginDto): Promise<LoginResponseDto> {
    const { username, password } = payload;

    this.logger.log(`Start ===> Login user \'${username}\' session.`, '');

    const externalUrl = `${process.env.AUTH_API}auth/login`;

    try {
      const { data } = await axios.post(externalUrl, {
        username,
        password,
        appcode: process.env.AUTH_API_APP_CODE
      });

      // save refresh token to redis
      this.cacheService.set(
        `refreshToken${data?.user?.nip}`,
        data?.jwt?.refreshToken,
        { ttl: data?.jwt?.expiresIn }
      );

      return {
        statusCode: 200,
        statusDescription: 'Berhasil Login',
        data
      };
    } catch (error) {
      this.logger.error('External request failed', 'error', error);
      throw new Error('External request failed');
    }
  }

  async logout(): Promise<any> {
    return {
      statusDescription: 'Logout berhasil!',
      data: {}
    };
  }
}
