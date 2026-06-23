import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';

export const redisCacheConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const redisUrl = configService.get('REDIS_URL') || 'redis://localhost:6379';
    return {
      stores: [
        createKeyv(redisUrl),
      ],
    };
  },
  inject: [ConfigService],
};
