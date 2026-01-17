import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserPermissions = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string[] => {
    const request = ctx.switchToHttp().getRequest<{
      user_permissions?: string[];
    }>();
    return request.user_permissions || [];
  },
);
