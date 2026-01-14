import {
  Body,
  Get,
  Headers,
  HttpCode,
  Inject,
  Ip,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import z from 'zod';
import {
  RefreshTokenResult,
  RefreshTokenUseCase,
} from '../use-case/token/refresh-token.use-case';
import { VerifiedToken } from '@panah/contract';
import {
  ApiController,
  ApiResponse,
  DeviceId,
  UserAgent,
} from 'src/utils/http';
import { VerifyTokenUseCase } from '../use-case/token/verify-token.use-case';
import { Validation } from 'src/utils/validation';
import { ErrorRefreshException } from '../exceptions/ErrorRefreshException';

const RefreshTokenBody = z.object({
  refresh_token: z.string(),
});

export class RefreshTokenResponse {
  static generate(payload: RefreshTokenResult) {
    return new RefreshTokenResponse(payload);
  }

  constructor(payload: RefreshTokenResult) {
    this.access_token = payload.access_token;
    this.refresh_token = payload.refresh_token;
  }

  @ApiProperty({
    description: 'JWT Access Token',
    example: { token: 'eyJhbG.....', expires_at: 1677721600 },
  })
  access_token: RefreshTokenResult['access_token'];

  @ApiProperty({
    description: 'JWT Refresh Token',
    example: { token: '.....', expires_at: 1677721600 },
  })
  refresh_token: RefreshTokenResult['refresh_token'];
}

export class VerifyTokenResponse {
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

@ApiController('auth/token', { tag: 'Token' })
export class TokenController {
  constructor(
    @Inject() private readonly verifyUseCase: VerifyTokenUseCase,
    @Inject() private readonly refreshUseCase: RefreshTokenUseCase,
  ) {}

  /**
   * Verify token
   */
  @Get('verify')
  @HttpCode(200)
  @Validation(RefreshTokenBody)
  @ApiResponse(VerifyTokenResponse, { status: 200 })
  async verifyToken(
    @Headers('Authorization') auth: string,
    @Ip() ip_address: string,
    @UserAgent() user_agent: string,
    @DeviceId() device_id: string,
  ) {
    try {
      const token = auth.replace('Bearer ', '');
      const result = await this.verifyUseCase.execute(token, {
        user_agent,
        ip_address,
        device_id,
      });

      return new VerifyTokenResponse(result);
    } catch {
      throw new UnauthorizedException();
    }
  }

  /**
   * Get jwk public key
   *
   * @returns {Promise<string>}
   */
  @Post('refresh')
  @HttpCode(201)
  @Validation(RefreshTokenBody)
  @ApiResponse(RefreshTokenResponse, { status: 201 })
  async refreshToken(
    @Body() body: z.infer<typeof RefreshTokenBody>,
    @Ip() ip_address: string,
    @UserAgent() user_agent: string,
    @DeviceId() device_id: string,
  ) {
    try {
      const res = await this.refreshUseCase.execute(body.refresh_token, {
        user_agent,
        ip_address,
        device_id,
      });

      return new RefreshTokenResponse(res);
    } catch (error) {
      if (error instanceof ErrorRefreshException) {
        throw new UnauthorizedException();
      }

      throw error;
    }
  }
}
