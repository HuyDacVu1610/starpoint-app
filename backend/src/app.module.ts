import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { redisCacheConfig } from './shared/config/redis.config';
import { RabbitMQModule } from './shared/rabbitmq/rabbitmq.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';
import { SemestersModule } from './semesters/semesters.module';
import { CompetitionsModule } from './competitions/competitions.module';
import { AchievementsModule } from './achievements/achievements.module';
import { ScoresModule } from './scores/scores.module';
import { ScholarshipsModule } from './scholarships/scholarships.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AuditLogInterceptor } from './shared/common/interceptors/audit-log.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync(redisCacheConfig),
    RabbitMQModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit:
          process.env.NODE_ENV === 'test' &&
          process.env.TEST_RATE_LIMIT !== 'true'
            ? 10000
            : 60,
      },
    ]),
    PrismaModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    UsersModule,
    UploadModule,
    SemestersModule,
    CompetitionsModule,
    AchievementsModule,
    ScoresModule,
    ScholarshipsModule,
    DashboardModule,
    AuditLogModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

