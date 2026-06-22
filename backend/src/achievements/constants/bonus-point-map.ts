import { AchievementCategory, AchievementRank } from '@starpointapp/shared';

export const BONUS_POINT_MAP: Record<
  AchievementCategory,
  Record<AchievementRank, number>
> = {
  [AchievementCategory.CENTRAL_COMPETITION]: {
    [AchievementRank.FIRST]: 0.4,
    [AchievementRank.SECOND]: 0.3,
    [AchievementRank.THIRD]: 0.2,
    [AchievementRank.NONE]: 0.0,
  },
  [AchievementCategory.ACADEMY_COMPETITION]: {
    [AchievementRank.FIRST]: 0.2,
    [AchievementRank.SECOND]: 0.15,
    [AchievementRank.THIRD]: 0.1,
    [AchievementRank.NONE]: 0.0,
  },
  [AchievementCategory.ORGANIZATION_PARTICIPATION]: {
    [AchievementRank.FIRST]: 0.0,
    [AchievementRank.SECOND]: 0.0,
    [AchievementRank.THIRD]: 0.0,
    [AchievementRank.NONE]: 0.1,
  },
  [AchievementCategory.SPECIAL_ACHIEVEMENT]: {
    [AchievementRank.FIRST]: 0.0,
    [AchievementRank.SECOND]: 0.0,
    [AchievementRank.THIRD]: 0.0,
    [AchievementRank.NONE]: 0.1,
  },
};
