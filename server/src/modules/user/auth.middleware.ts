import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.request';
import { VerifyTokenUseCase } from './use-case/token/verify-token.use-case';
import { VerifiedToken } from '@panah/contract';
import { ErrorTokenException } from './exceptions/ErrorTokenException';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(@Inject() private readonly auth: VerifyTokenUseCase) {}

  private _getTokenFromHeader(req: Request) {
    const auth = req.headers.authorization;
    if (!auth) {
      return null;
    }

    const [type, token] = auth.split(' ');
    if (type !== 'Bearer') {
      return null;
    }

    if (!token.trim().length) {
      return null;
    }

    return token;
  }

  use(req: AuthRequest, res: Response, next: NextFunction) {
    const token = this._getTokenFromHeader(req);
    this.validate(token, (access, error) => {
      if (!error) {
        req.access_token = access ?? undefined;
        next();
        return;
      }

      next(new ErrorTokenException('invalid token'));
    });
  }

  validate(
    token: string | null,
    next: (access: VerifiedToken | null, err?: Error) => void,
  ) {
    if (!token) {
      return next(null);
    }

    this.auth
      .execute(token)
      .then((access_token) => next(access_token))
      .catch((error) => {
        if (error instanceof ErrorTokenException) {
          return next(null);
        }

        if (error instanceof Error) {
          return next(null, error);
        }

        next(null, new Error('Cannot verify token', { cause: error }));
      });
  }
}
