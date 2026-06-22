"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./services/auth.service");
const password_reset_service_1 = require("./services/password-reset.service");
const mail_service_1 = require("./services/mail.service");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const jwt_refresh_strategy_1 = require("./strategies/jwt-refresh.strategy");
const auth_controller_1 = require("./controllers/auth.controller");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.register({}),
            mailer_1.MailerModule.forRootAsync({
                useFactory: (config) => ({
                    transport: {
                        host: config.get('MAIL_HOST') || 'localhost',
                        port: config.get('MAIL_PORT') || 1025,
                        secure: config.get('MAIL_PORT') === 465,
                        auth: config.get('MAIL_USER')
                            ? {
                                user: config.get('MAIL_USER'),
                                pass: config.get('MAIL_PASS'),
                            }
                            : undefined,
                    },
                    defaults: {
                        from: '"StarPoint" <noreply@starpoint.dev>',
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [
            auth_service_1.AuthService,
            password_reset_service_1.PasswordResetService,
            mail_service_1.MailService,
            jwt_strategy_1.JwtStrategy,
            jwt_refresh_strategy_1.JwtRefreshStrategy,
        ],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, passport_1.PassportModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map