import { ScoresService } from '../services/scores.service';
export declare class ScoresMessageController {
    private readonly scoresService;
    constructor(scoresService: ScoresService);
    handleAchievementCreated(data: {
        userId: number;
        semesterId: number;
    }): Promise<void>;
}
