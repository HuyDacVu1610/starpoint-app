import { PaginationQueryDto } from '../../shared/common/dto/pagination-query.dto';
import { CompetitionLevel } from '@starpointapp/shared';
export declare class QueryCompetitionDto extends PaginationQueryDto {
    semesterId?: number;
    level?: CompetitionLevel;
}
