import { Grade } from '@prisma/client';
import { PaginationQueryDto } from '../../shared/common/dto/pagination-query.dto';
export declare class QueryCandidateDto extends PaginationQueryDto {
    semesterId?: number;
    userId?: number;
    isEligible?: boolean;
    scholarshipTier?: Grade;
}
