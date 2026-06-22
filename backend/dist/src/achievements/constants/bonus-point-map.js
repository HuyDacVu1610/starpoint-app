"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BONUS_POINT_MAP = void 0;
const shared_1 = require("@starpointapp/shared");
exports.BONUS_POINT_MAP = {
    [shared_1.AchievementCategory.CENTRAL_COMPETITION]: {
        [shared_1.AchievementRank.FIRST]: 0.4,
        [shared_1.AchievementRank.SECOND]: 0.3,
        [shared_1.AchievementRank.THIRD]: 0.2,
        [shared_1.AchievementRank.NONE]: 0.0,
    },
    [shared_1.AchievementCategory.ACADEMY_COMPETITION]: {
        [shared_1.AchievementRank.FIRST]: 0.2,
        [shared_1.AchievementRank.SECOND]: 0.15,
        [shared_1.AchievementRank.THIRD]: 0.1,
        [shared_1.AchievementRank.NONE]: 0.0,
    },
    [shared_1.AchievementCategory.ORGANIZATION_PARTICIPATION]: {
        [shared_1.AchievementRank.FIRST]: 0.0,
        [shared_1.AchievementRank.SECOND]: 0.0,
        [shared_1.AchievementRank.THIRD]: 0.0,
        [shared_1.AchievementRank.NONE]: 0.1,
    },
    [shared_1.AchievementCategory.SPECIAL_ACHIEVEMENT]: {
        [shared_1.AchievementRank.FIRST]: 0.0,
        [shared_1.AchievementRank.SECOND]: 0.0,
        [shared_1.AchievementRank.THIRD]: 0.0,
        [shared_1.AchievementRank.NONE]: 0.1,
    },
};
//# sourceMappingURL=bonus-point-map.js.map