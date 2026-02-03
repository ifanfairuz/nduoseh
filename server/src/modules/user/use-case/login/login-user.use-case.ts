import { getUnixTime } from 'date-fns';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Account, AuthSession, Role } from '@panah/contract';
import { ClientInfo, LoginResponse } from '@panah/contract';
import { AuthSessionRepository } from '../../repositories/auth-session.repository';
import { RefreshTokenRepository } from '../../repositories/refresh-token.repository';
import { AccessTokenRepository } from '../../repositories/access-token.repository';
import { OnUserLogin } from '../../event/OnUserLogin';
import { PrismaAtomicService } from 'src/services/prisma/atomic.service';
import { RefreshTokenService } from '../../services/refresh-token.service';
import { AccessTokenService } from '../../services/access-token.service';
import { GetUserInfoUseCase } from '../user/get-user-info.user-case';
import { MeResult } from '../../repositories/user.repository';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject()
    private readonly atomic: PrismaAtomicService,
    @Inject()
    private readonly emitter: EventEmitter2,
    @Inject()
    private readonly accessTokenService: AccessTokenService,
    @Inject()
    private readonly refresTokenService: RefreshTokenService,
    @Inject()
    private readonly sessionRepository: AuthSessionRepository,
    @Inject()
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject()
    private readonly accessTokenRepository: AccessTokenRepository,
    @Inject()
    private readonly userInfo: GetUserInfoUseCase,
  ) {}

  /**
   * Dispatch hooks
   *
   */
  protected async dispatchHooks(session: AuthSession, user: MeResult) {
    await this.emitter.emitAsync('user.login', new OnUserLogin(session, user));
  }

  /**
   * Login user with user id
   *
   * @param {MeResult} me
   * @returns {Promise<AuthSession>}
   */
  public async execute(
    account: Account,
    me: MeResult,
    client: ClientInfo,
  ): Promise<LoginResponse> {
    const result = await this.atomic.tx(async (tx) => {
      // create session
      const session = await this.sessionRepository.create(
        {
          user_id: account.user_id,
          account_id: account.id,
          ip_address: client.ip_address ?? null,
          user_agent: client.user_agent ?? null,
          device_id: client.device_id ?? null,
        },
        { tx },
      );

      // generate refresh token
      const refresh_token = await this.refresTokenService.generate(session.id);

      // store refresh token to persistance database
      await this.refreshTokenRepository.store(
        {
          id: refresh_token.id,
          session_id: session.id,
          token_hash: refresh_token.hash,
          expires_at: refresh_token.expires_at,
        },
        { tx },
      );

      // generate access token
      const access_token = await this.accessTokenService.generate(
        account.user_id,
        session.id,
        client,
      );

      // store access token to storage
      await this.accessTokenRepository.store({
        user_id: account.user_id,
        session_id: session.id,
        token_hash: access_token.hash,
        expires_at: access_token.expires_at,
      });

      return {
        session,
        refresh_token,
        access_token,
      };
    });

    await this.dispatchHooks(result.session, me);

    const info = await this.userInfo.getInfo(me.id);
    const { userRoles, ...user } = me;
    return {
      access_token: {
        token: result.access_token.token,
        expires_at: getUnixTime(result.access_token.expires_at),
      },
      refresh_token: {
        token: result.refresh_token.token,
        expires_at: getUnixTime(result.refresh_token.expires_at),
      },
      ...info,
      user,
      roles: userRoles.map((ur) => ur.role as Role),
    };
  }
}
