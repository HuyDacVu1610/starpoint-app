"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetitionsModule = void 0;
const common_1 = require("@nestjs/common");
const competitions_service_1 = require("./services/competitions.service");
const competitions_controller_1 = require("./controllers/competitions.controller");
const competitions_repository_1 = require("./repositories/competitions.repository");
const semesters_module_1 = require("../semesters/semesters.module");
let CompetitionsModule = class CompetitionsModule {
};
exports.CompetitionsModule = CompetitionsModule;
exports.CompetitionsModule = CompetitionsModule = __decorate([
    (0, common_1.Module)({
        imports: [semesters_module_1.SemestersModule],
        controllers: [competitions_controller_1.CompetitionsController],
        providers: [competitions_service_1.CompetitionsService, competitions_repository_1.CompetitionsRepository],
        exports: [competitions_service_1.CompetitionsService],
    })
], CompetitionsModule);
//# sourceMappingURL=competitions.module.js.map