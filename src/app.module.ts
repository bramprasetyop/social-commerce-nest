import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import {
  Inject,
  MiddlewareConsumer,
  Module,
  RequestMethod
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as redisStore from 'cache-manager-redis-store';
import { join } from 'path';

import { HomeController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './core/database/database.module';
import { ResponseMiddleware } from './core/middleware';
import { ConnectionModule } from './core/service/connection/connection.module';
import { LoggerService } from './core/service/logger/logger.service';
import { SftpModule } from './core/service/sftp/sftp.module';
import { CronModule } from './cron/cron.module';
import { GenerateLinksModule } from './generateLink/generateLinks.module';
import { OtpsModule } from './otp/otps.module';
import { PartnerUsersModule } from './partnerUsers/partnerUsers.module';
import { PartnersModule } from './partners/partners.module';
import { PermissionsModule } from './permissions/permissions.module';
import { UserHeirsModule } from './userHeirs/userHeirs.module';
import { UserProductsModule } from './userProducts/userProducts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..')
    }),
    DatabaseModule,
    AuthModule,
    ConnectionModule,
    CronModule,
    SftpModule,
    PermissionsModule,
    GenerateLinksModule,
    OtpsModule,
    PartnersModule,
    PartnerUsersModule,
    UserProductsModule,
    UsersModule,
    UserHeirsModule
  ],
  controllers: [HomeController],
  providers: [LoggerService]
})
export class AppModule {
  constructor(@Inject(CACHE_MANAGER) cacheManager) {
    try {
      const client = cacheManager.store.getClient();

      client.on('error', error => {
        console.info(`Redis error: ${error}`);
      });

      client.on('end', () => {
        console.info('Redis connection ended');
      });

      client.on('reconnecting', () => {
        console.info('Redis is reconnecting');
      });
    } catch (error) {
      console.error(
        `Error while initializing Redis connection: ${error.message}`
      );
    }
  }

  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ResponseMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
