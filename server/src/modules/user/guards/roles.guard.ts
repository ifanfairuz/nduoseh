import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRequest } from '../auth.request';
import { UserRoleRepository } from '../repositories/user-role.repository';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @Inject() private readonly reflector: Reflector,
    @Inject() private readonly userRoleRepository: UserRoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = request.access_token;

    if (!token) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    // Check if user has at least one of the required roles
    const hasRole = await Promise.all(
      requiredRoles.map((role) =>
        this.userRoleRepository.hasRole(token.user_id, role),
      ),
    );

    if (!hasRole.some((h) => h)) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
