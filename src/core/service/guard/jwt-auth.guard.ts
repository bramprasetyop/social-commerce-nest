import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Cache } from 'cache-manager';
import * as jwt from 'jsonwebtoken';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache
  ) {
    super();
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET
      });
    } catch (error) {
      return false;
    }
  }

  async verifyRefreshToken(token: string): Promise<any> {
    try {
      const decoded: any = jwt.decode(token);
      const refreshToken = await this.cacheService.get<any>(
        `refreshToken${decoded?.nip}`
      );
      return await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_TOKEN
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!accessToken) {
      throw new UnauthorizedException('Access token not found');
    }

    const decodedToken: any = jwt.decode(accessToken);
    request.permissions = ['GENERATELINK_CAN_CREATE'];
    request.user = decodedToken;

    try {
      const isValidToken = await this.verifyToken(accessToken);
      if (!isValidToken) {
        return await this.verifyRefreshToken(accessToken);
      }
      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
