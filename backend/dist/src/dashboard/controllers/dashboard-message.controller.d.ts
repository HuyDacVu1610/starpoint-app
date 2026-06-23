import { DashboardService } from '../services/dashboard.service';
export declare class DashboardMessageController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    handleBonusCalculated(data: {
        semesterId: number;
    }): Promise<void>;
}
