import { AchievementCategory, AchievementRank, AchievementStatus } from '@starpointapp/shared';
export declare class CreateAchievementDto {
    userId?: number;
    competitionId?: number;
    semesterId: number;
    category: AchievementCategory;
    rank: AchievementRank;
    evidenceFileId?: number;
    note?: string;
    status?: AchievementStatus;
}
