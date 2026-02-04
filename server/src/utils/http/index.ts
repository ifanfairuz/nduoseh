import {
  applyDecorators,
  Controller,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiResponse as ApiResponseDecorator,
  ApiResponseOptions,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from 'src/modules/user/auth.guard';
import { AuthedRequest } from 'src/modules/user/auth.request';
import { Constructor } from '../class-helper';
import { ApiValidationResponse } from '../validation/error-validation.response';
import { ApiServerErrorResponse } from './error.response';

interface ApiControllerOptions {
  tag?: string;
  auth?: boolean;
}

const Tags = (tag?: string) => {
  if (tag?.length) {
    return ApiTags(tag);
  }

  return ApiTags('API');
};

export function ApiController(
  prefix: string,
  options?: ApiControllerOptions,
): ClassDecorator {
  const path = prefix.startsWith('/') ? prefix : 'api/' + prefix;
  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] = [
    Controller(path),
    Tags(options?.tag),
  ];

  if (options?.auth) {
    decorators.push(ApiBearerAuth(), Authed());
  }

  return applyDecorators(...decorators);
}

export function Authed(): MethodDecorator & ClassDecorator {
  return UseGuards(AuthGuard);
}

export const UserAgent = createParamDecorator((_, ctx: ExecutionContext) => {
  const type = ctx.getType();

  if (type == 'http') {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.get('user-agent');
  }

  return '';
});

export const DeviceId = createParamDecorator((_, ctx: ExecutionContext) => {
  const type = ctx.getType();

  if (type == 'http') {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.get('X-Device-Id');
  }

  return '';
});

export const Token = createParamDecorator((_, ctx: ExecutionContext) => {
  const type = ctx.getType();

  if (type == 'http') {
    const request = ctx.switchToHttp().getRequest<AuthedRequest>();
    return request.access_token;
  }

  return '';
});

export const RefreshToken = createParamDecorator((_, ctx: ExecutionContext) => {
  const type = ctx.getType();

  if (type == 'http') {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (request.cookies && 'refresh_token' in request.cookies) {
      const cookie = request.cookies as Record<string, unknown>;
      const token = cookie['refresh_token'];
      if (typeof token === 'string') {
        return token;
      }
    }
  }

  return undefined;
});

export const Domain = createParamDecorator((_, ctx: ExecutionContext) => {
  const type = ctx.getType();

  if (type == 'http') {
    const request = ctx.switchToHttp().getRequest<Request>();

    // Try X-Forwarded-Host first (common in proxied environments)
    const forwardedHost = request.get('X-Forwarded-Host');
    if (forwardedHost) {
      const protocol = request.get('X-Forwarded-Proto') || 'https';
      return `${protocol}://${forwardedHost}`;
    }

    // Try X-Forwarded-For with protocol
    const forwardedFor = request.get('X-Forwarded-For');
    if (forwardedFor) {
      const host = forwardedFor.split(',')[0].trim();
      const protocol = request.get('X-Forwarded-Proto') || 'https';
      return `${protocol}://${host}`;
    }

    // Try standard Host header
    const host = request.get('Host');
    if (host) {
      const protocol = request.protocol || 'https';
      return `${protocol}://${host}`;
    }

    // Try Origin header
    const origin = request.get('Origin');
    if (origin) {
      return origin;
    }

    // Try Referer header
    const referer = request.get('Referer');
    if (referer) {
      try {
        const url = new URL(referer);
        return `${url.protocol}//${url.host}`;
      } catch {
        // Invalid URL, continue to fallback
      }
    }

    // Fallback to BASE_URL from environment
    if (process.env.BASE_URL) {
      return process.env.BASE_URL;
    }

    // Final fallback to empty string
    return '';
  }

  return '';
});

export const ApiResponse = <T>(
  type?: Constructor<T>,
  config?: ApiResponseOptions,
) => {
  return applyDecorators(
    ApiResponseDecorator({
      ...config,
      description: 'Success',
      type,
    }),
    ApiValidationResponse(),
    ApiServerErrorResponse(),
  );
};
