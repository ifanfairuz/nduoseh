import type {
  LoginResponse,
  TokenResponse,
  VerifiedToken,
  IAuthResponse,
  IRefreshTokenResponse,
  IVerifyTokenResponse,
} from '@panah/contract';
import { MeResponse } from './user.response';
import { ApiProperty } from '@nestjs/swagger';
import { UserImageDisk } from '../storage/user-image.disk';
import { RefreshTokenResult } from '../use-case/token/refresh-token.use-case';
import { Response } from 'express';
import { fromUnixTime } from 'date-fns';

export class AuthResponse implements IAuthResponse {
  constructor(payload: LoginResponse) {
    this.access_token = payload.access_token;
    this.user = new MeResponse(
      payload.user,
      payload.permissions,
      payload.modules,
    );
  }

  static async withImageUrl(
    payload: LoginResponse,
    storage: UserImageDisk,
    domain?: string,
  ) {
    const response = new AuthResponse(payload);
    response.user = await MeResponse.withImageUrl(
      payload.user,
      storage,
      domain,
      payload.permissions,
      payload.modules,
      payload.roles,
    );
    return response;
  }

  @ApiProperty({
    description: 'JWT Access Token',
    example: { token: 'eyJhbG.....', expires_at: 1677721600 },
  })
  access_token: TokenResponse;

  @ApiProperty({
    description: 'User information',
  })
  user: MeResponse;
}

export class RefreshTokenResponse implements IRefreshTokenResponse {
  static generate(payload: RefreshTokenResult) {
    return new RefreshTokenResponse(payload);
  }

  static attachCookie(res: Response, refresh_token: TokenResponse) {
    res.cookie('refresh_token', refresh_token.token, {
      expires: fromUnixTime(refresh_token.expires_at),
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/api/auth/token/refresh',
    });
  }

  static clearCookie(res: Response) {
    res.clearCookie('refresh_token', { path: '/api/auth/token/refresh' });
  }

  constructor(payload: RefreshTokenResult) {
    this.access_token = payload.access_token;
  }

  @ApiProperty({
    description: 'JWT Access Token',
    example: { token: 'eyJhbG.....', expires_at: 1677721600 },
  })
  access_token: RefreshTokenResult['access_token'];
}

export class VerifyTokenResponse implements IVerifyTokenResponse {
  static generate(payload: VerifiedToken) {
    return new VerifyTokenResponse(payload);
  }

  constructor(payload: VerifiedToken) {
    this.user_id = payload.user_id;
    this.session_id = payload.session_id;
  }

  @ApiProperty({
    description: 'User ID',
    example: 'adfhaodfijadf',
  })
  user_id: string;

  @ApiProperty({
    description: 'Session ID',
    example: 'akdjfpalkdfjpakdnfapdskj',
  })
  session_id: string;
}
