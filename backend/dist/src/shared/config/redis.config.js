"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisCacheConfig = void 0;
const config_1 = require("@nestjs/config");
const redis_1 = require("@keyv/redis");
exports.redisCacheConfig = {
    isGlobal: true,
    imports: [config_1.ConfigModule],
    useFactory: (configService) => {
        const redisUrl = configService.get('REDIS_URL') || 'redis://localhost:6379';
        return {
            stores: [
                (0, redis_1.createKeyv)(redisUrl),
            ],
        };
    },
    inject: [config_1.ConfigService],
};
//# sourceMappingURL=redis.config.js.map