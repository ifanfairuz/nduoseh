import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRequest } from '../auth.request';
import { GetUserPermissionsUseCase } from '../use-case/user-role/get-user-permissions.use-case';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    @Inject() private readonly reflector: Reflector,
    @Inject()
    private readonly getUserPermissions: GetUserPermissionsUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = request.access_token;

    if (!token) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    // Get user permissions (cached or from DB)
    const userPermissions = await this.getUserPermissions.execute(
      token.user_id,
    );

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    // Attach permissions to request for later use
    (request as AuthRequest & { user_permissions: string[] }).user_permissions =
      userPermissions;

    return true;
  }
}
