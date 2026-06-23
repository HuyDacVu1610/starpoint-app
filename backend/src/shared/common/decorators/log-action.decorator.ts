import { SetMetadata } from '@nestjs/common';

export const LOG_ACTION_KEY = 'log_action';

export interface LogActionMetadata {
  action: string;
  module: string;
}

export const LogAction = (action: string, module: string) =>
  SetMetadata(LOG_ACTION_KEY, { action, module });
