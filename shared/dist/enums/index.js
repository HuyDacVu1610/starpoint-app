"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.Grade = exports.AchievementRank = exports.AchievementCategory = exports.CompetitionLevel = void 0;
var CompetitionLevel;
(function (CompetitionLevel) {
    CompetitionLevel["CENTRAL"] = "CENTRAL";
    CompetitionLevel["ACADEMY"] = "ACADEMY";
})(CompetitionLevel || (exports.CompetitionLevel = CompetitionLevel = {}));
var AchievementCategory;
(function (AchievementCategory) {
    AchievementCategory["CENTRAL_COMPETITION"] = "CENTRAL_COMPETITION";
    AchievementCategory["ACADEMY_COMPETITION"] = "ACADEMY_COMPETITION";
    AchievementCategory["ORGANIZATION_PARTICIPATION"] = "ORGANIZATION_PARTICIPATION";
    AchievementCategory["SPECIAL_ACHIEVEMENT"] = "SPECIAL_ACHIEVEMENT";
})(AchievementCategory || (exports.AchievementCategory = AchievementCategory = {}));
var AchievementRank;
(function (AchievementRank) {
    AchievementRank["FIRST"] = "FIRST";
    AchievementRank["SECOND"] = "SECOND";
    AchievementRank["THIRD"] = "THIRD";
    AchievementRank["NONE"] = "NONE";
})(AchievementRank || (exports.AchievementRank = AchievementRank = {}));
var Grade;
(function (Grade) {
    Grade["EXCELLENT"] = "EXCELLENT";
    Grade["GOOD"] = "GOOD";
    Grade["FAIR"] = "FAIR";
    Grade["AVERAGE"] = "AVERAGE";
    Grade["WEAK"] = "WEAK";
    Grade["POOR"] = "POOR";
})(Grade || (exports.Grade = Grade = {}));
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["STAFF"] = "STAFF";
    UserRole["STUDENT"] = "STUDENT";
})(UserRole || (exports.UserRole = UserRole = {}));
