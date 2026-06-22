"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementsModule = void 0;
const common_1 = require("@nestjs/common");
const achievements_service_1 = require("./services/achievements.service");
const achievements_controller_1 = require("./controllers/achievements.controller");
const achievements_repository_1 = require("./repositories/achievements.repository");
const semesters_module_1 = require("../semesters/semesters.module");
const competitions_module_1 = require("../competitions/competitions.module");
const users_module_1 = require("../users/users.module");
const prisma_module_1 = require("../prisma/prisma.module");
let AchievementsModule = class AchievementsModule {
};
exports.AchievementsModule = AchievementsModule;
exports.AchievementsModule = AchievementsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, semesters_module_1.SemestersModule, competitions_module_1.CompetitionsModule, users_module_1.UsersModule],
        controllers: [achievements_controller_1.AchievementsController],
        providers: [achievements_service_1.AchievementsService, achievements_repository_1.AchievementsRepository],
        exports: [achievements_service_1.AchievementsService],
    })
], AchievementsModule);
//# sourceMappingURL=achievements.module.js.map