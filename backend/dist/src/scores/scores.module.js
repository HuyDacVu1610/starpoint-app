"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoresModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const scores_repository_1 = require("./repositories/scores.repository");
const scores_service_1 = require("./services/scores.service");
const scores_controller_1 = require("./controllers/scores.controller");
const scholarships_module_1 = require("../scholarships/scholarships.module");
let ScoresModule = class ScoresModule {
};
exports.ScoresModule = ScoresModule;
exports.ScoresModule = ScoresModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, (0, common_1.forwardRef)(() => scholarships_module_1.ScholarshipsModule)],
        controllers: [scores_controller_1.ScoresController],
        providers: [scores_service_1.ScoresService, scores_repository_1.ScoresRepository],
        exports: [scores_service_1.ScoresService],
    })
], ScoresModule);
//# sourceMappingURL=scores.module.js.map