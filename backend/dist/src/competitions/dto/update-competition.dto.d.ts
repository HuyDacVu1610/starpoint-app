import { CompetitionLevel } from '@starpointapp/shared';
export declare class UpdateCompetitionDto {
    name?: string;
    level?: CompetitionLevel;
    organizer?: string;
    eventDate?: Date;
    semesterId?: number;
}
