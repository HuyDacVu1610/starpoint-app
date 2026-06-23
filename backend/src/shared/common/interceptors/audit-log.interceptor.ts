import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LOG_ACTION_KEY, LogActionMetadata } from '../decorators/log-action.decorator';
import { AuditLogService } from '../../../audit-log/services/audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const meta = this.reflector.getAllAndOverride<LogActionMetadata>(LOG_ACTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!meta) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userId = user?.id;

    // Filter out sensitive data from request body
    const bodyCopy = { ...request.body };
    const sensitiveKeys = ['password', 'currentPassword', 'newPassword'];
    for (const key of sensitiveKeys) {
      if (key in bodyCopy) {
        bodyCopy[key] = '[FILTERED]';
      }
    }

    const detailObj = {
      params: request.params,
      query: request.query,
      body: bodyCopy,
    };

    return next.handle().pipe(
      tap(() => {
        // Log action asynchronously after success
        void this.auditLogService.log({
          userId,
          action: meta.action,
          module: meta.module,
          detail: JSON.stringify(detailObj),
        });
      }),
    );
  }
}
