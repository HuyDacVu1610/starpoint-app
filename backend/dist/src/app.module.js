"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const redis_config_1 = require("./shared/config/redis.config");
const rabbitmq_module_1 = require("./shared/rabbitmq/rabbitmq.module");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const roles_module_1 = require("./roles/roles.module");
const permissions_module_1 = require("./permissions/permissions.module");
const users_module_1 = require("./users/users.module");
const upload_module_1 = require("./upload/upload.module");
const semesters_module_1 = require("./semesters/semesters.module");
const competitions_module_1 = require("./competitions/competitions.module");
const achievements_module_1 = require("./achievements/achievements.module");
const scores_module_1 = require("./scores/scores.module");
const scholarships_module_1 = require("./scholarships/scholarships.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const audit_log_module_1 = require("./audit-log/audit-log.module");
const audit_log_interceptor_1 = require("./shared/common/interceptors/audit-log.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            cache_manager_1.CacheModule.registerAsync(redis_config_1.redisCacheConfig),
            rabbitmq_module_1.RabbitMQModule,
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'default',
                    ttl: 60000,
                    limit: process.env.NODE_ENV === 'test' &&
                        process.env.TEST_RATE_LIMIT !== 'true'
                        ? 10000
                        : 60,
                },
            ]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            roles_module_1.RolesModule,
            permissions_module_1.PermissionsModule,
            users_module_1.UsersModule,
            upload_module_1.UploadModule,
            semesters_module_1.SemestersModule,
            competitions_module_1.CompetitionsModule,
            achievements_module_1.AchievementsModule,
            scores_module_1.ScoresModule,
            scholarships_module_1.ScholarshipsModule,
            dashboard_module_1.DashboardModule,
            audit_log_module_1.AuditLogModule,
        ],
        controllers: [],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_log_interceptor_1.AuditLogInterceptor,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map