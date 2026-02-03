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
    private readonly getUserPermissionsUseCase: GetUserPermissionsUseCase,
  ) {}

  private _userPermissions: string[] | undefined;

  private _somePermissions: string[] | undefined;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    // Get required permissions from decorator
    const requiredPermissions = this.getMetadata('permissions', context);

    // Get some permissions from decorator
    this._somePermissions = this.getMetadata('some-permissions', context);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      await this.checkSomePermissions(request);
      return true;
    }

    // Check if user has all required permissions
    await this.checkPermissions(request, requiredPermissions, 'all');

    // Check if user has some required permissions
    await this.checkSomePermissions(request);

    return true;
  }

  private getMetadata(key: string, context: ExecutionContext) {
    return this.reflector.getAllAndOverride<string[]>(key, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private async checkPermissions(
    request: AuthRequest,
    permissions: string[],
    type: 'all' | 'some',
  ) {
    const userPermissions = await this.getUserPermissions(request);

    let typeInfo = 'Required';
    let granted = false;
    switch (type) {
      case 'all':
        granted = permissions.every((perm) => userPermissions.includes(perm));
        typeInfo = 'Required';
        break;
      case 'some':
        granted = permissions.some((perm) => userPermissions.includes(perm));
        typeInfo = 'Requires any of';
        break;
    }

    if (!granted) {
      throw new ForbiddenException(
        `Insufficient permissions. ${typeInfo}: ${permissions.join(', ')}`,
      );
    }
  }

  private async checkSomePermissions(request: AuthRequest) {
    if (!this._somePermissions || this._somePermissions.length === 0) {
      return true;
    }

    await this.checkPermissions(request, this._somePermissions, 'some');
  }

  private async getUserPermissions(request: AuthRequest) {
    if (this._userPermissions) return this._userPermissions;

    const token = request.access_token;
    if (!token) {
      throw new ForbiddenException(`Insufficient permissions.`);
    }

    // Get user permissions (cached or from DB)
    const userPermissions = await this.getUserPermissionsUseCase.execute(
      token.user_id,
    );

    // Attach permissions to request for later use
    (request as AuthRequest & { user_permissions: string[] }).user_permissions =
      userPermissions;

    this._userPermissions = userPermissions;
    return this._userPermissions;
  }
}
