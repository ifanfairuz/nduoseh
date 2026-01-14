import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRequest } from './auth.request';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const type = context.getType();
    if (type == 'http') {
      const request = context.switchToHttp().getRequest<AuthRequest>();
      if (!request.access_token) {
        throw new UnauthorizedException();
      }

      return true;
    }

    throw new UnauthorizedException();
  }
}
