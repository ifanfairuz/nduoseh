import {
  Body,
  Get,
  Headers,
  HttpCode,
  Inject,
  Ip,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { RefreshTokenUseCase } from '../use-case/token/refresh-token.use-case';
import {
  ApiController,
  ApiResponse,
  DeviceId,
  RefreshToken,
  UserAgent,
} from 'src/utils/http';
import { VerifyTokenUseCase } from '../use-case/token/verify-token.use-case';
import { ErrorRefreshException } from '../exceptions/ErrorRefreshException';
import {
  RefreshTokenResponse,
  VerifyTokenResponse,
} from '../response/auth.response';

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
  @ApiResponse(RefreshTokenResponse, { status: 201 })
  async refreshToken(
    @Ip() ip_address: string,
    @UserAgent() user_agent: string,
    @DeviceId() device_id: string,
    @Res({ passthrough: true }) res: Response,
    @RefreshToken() refresh_token?: string,
  ) {
    console.log(refresh_token);
    if (!refresh_token) {
      throw new UnauthorizedException();
    }

    try {
      const result = await this.refreshUseCase.execute(refresh_token, {
        user_agent,
        ip_address,
        device_id,
      });

      RefreshTokenResponse.attachCookie(res, result.refresh_token);
      return new RefreshTokenResponse(result);
    } catch (error) {
      if (error instanceof ErrorRefreshException) {
        throw new UnauthorizedException();
      }

      throw error;
    }
  }
}
