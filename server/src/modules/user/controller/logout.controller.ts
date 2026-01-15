import type { Response } from 'express';
import { Inject, HttpCode, Delete, Logger, Res } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { VerifiedToken } from '@panah/contract';

import { ApiController, ApiResponse, Token } from 'src/utils/http';
import { LogoutUseCase } from '../use-case/logout.use-case';
import { RefreshTokenResponse } from '../response/auth.response';

@ApiController('auth/logout', { tag: 'Auth' })
@ApiBearerAuth()
export class LogoutController {
  private readonly logger = new Logger(LogoutController.name);

  constructor(@Inject() private readonly logoutUseCase: LogoutUseCase) {}

  /**
   * Get current user
   *
   * @param {VerifiedToken} token
   * @returns {Promise<User>}
   */
  @Delete()
  @HttpCode(204)
  @ApiResponse(undefined, {
    status: 204,
    description: 'no-content',
  })
  async getUser(@Res() res: Response, @Token() token?: VerifiedToken) {
    RefreshTokenResponse.clearCookie(res);
    res.status(204).send();

    if (!token) return;

    try {
      await this.logoutUseCase.execute(token);
    } catch (e) {
      this.logger.error('Cannot logout', e);
    }
  }
}
