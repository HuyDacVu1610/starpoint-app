"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardMessageController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const dashboard_service_1 = require("../services/dashboard.service");
let DashboardMessageController = class DashboardMessageController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async handleBonusCalculated(data) {
        console.log('Received bonus.calculated event via RabbitMQ for semester:', data.semesterId);
        await this.dashboardService.clearCache(data.semesterId);
    }
};
exports.DashboardMessageController = DashboardMessageController;
__decorate([
    (0, microservices_1.EventPattern)('bonus.calculated'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardMessageController.prototype, "handleBonusCalculated", null);
exports.DashboardMessageController = DashboardMessageController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardMessageController);
//# sourceMappingURL=dashboard-message.controller.js.map