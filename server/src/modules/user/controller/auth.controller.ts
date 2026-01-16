import { Body, HttpCode, Inject, Ip, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiController,
  ApiResponse,
  DeviceId,
  UserAgent,
  Domain,
} from 'src/utils/http';
import { Validation } from 'src/utils/validation';
import z from 'zod';
import type { ILoginWithPasswordBody } from '@panah/contract';
import { LoginPasswordUseCase } from '../use-case/login/login-password.use-case';
import { AuthResponse, RefreshTokenResponse } from '../response/auth.response';
import { UserImageDisk } from '../storage/user-image.disk';

const LoginBody = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(1, 'Invalid password'),
});

@ApiController('auth/password', { tag: 'Auth' })
export class AuthController {
  constructor(
    @Inject() private readonly loginUseCase: LoginPasswordUseCase,
    @Inject() private readonly disk: UserImageDisk,
  ) {}

  /**
   * Login user with password
   *
   * @param {LoginBody} body
   * @returns {Promise<string>}
   */
  @Post('login')
  @HttpCode(200)
  @Validation(LoginBody)
  @ApiResponse(AuthResponse, { status: 200 })
  async loginWithPassword(
    @Body() body: ILoginWithPasswordBody,
    @Ip() ip_address: string,
    @UserAgent() user_agent: string,
    @DeviceId() device_id: string,
    @Domain() domain: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const payload = await this.loginUseCase.execute({
      data: body,
      client: {
        ip_address,
        user_agent,
        device_id,
      },
    });

    RefreshTokenResponse.attachCookie(res, payload.refresh_token);
    return await AuthResponse.withImageUrl(payload, this.disk, domain);
  }
}
