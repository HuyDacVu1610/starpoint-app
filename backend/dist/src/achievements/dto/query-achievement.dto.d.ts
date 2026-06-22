import { PaginationQueryDto } from '../../shared/common/dto/pagination-query.dto';
import { AchievementCategory, AchievementStatus } from '@starpointapp/shared';
export declare class QueryAchievementDto extends PaginationQueryDto {
    semesterId?: number;
    category?: AchievementCategory;
    userId?: number;
    status?: AchievementStatus;
}
