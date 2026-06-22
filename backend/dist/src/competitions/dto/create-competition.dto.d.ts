import { CompetitionLevel } from '@starpointapp/shared';
export declare class CreateCompetitionDto {
    name: string;
    level: CompetitionLevel;
    organizer?: string;
    eventDate: Date;
    semesterId: number;
}
