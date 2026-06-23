"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogAction = exports.LOG_ACTION_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.LOG_ACTION_KEY = 'log_action';
const LogAction = (action, module) => (0, common_1.SetMetadata)(exports.LOG_ACTION_KEY, { action, module });
exports.LogAction = LogAction;
//# sourceMappingURL=log-action.decorator.js.map