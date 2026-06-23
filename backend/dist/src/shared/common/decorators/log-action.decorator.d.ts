export declare const LOG_ACTION_KEY = "log_action";
export interface LogActionMetadata {
    action: string;
    module: string;
}
export declare const LogAction: (action: string, module: string) => import("@nestjs/common").CustomDecorator<string>;
