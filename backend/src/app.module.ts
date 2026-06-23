import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
