import { Injectable } from '@nestjs/common';
import { Account, PasswordAccount, User } from '@nduoseh/contract';
import {
  PrismaMethodOptions,
  PrismaRepository,
} from 'src/services/prisma/prisma.repository';
import { createCuid2Generator } from 'src/utils/generator';
import { MeResult } from './user.repository';

export type AccountCreateWithPasswordPayload = Pick<
  PasswordAccount,
  'user_id' | 'password'
>;

export type AccountCreateWithSSOPayload = Omit<Account, 'id' | 'password'>;

export const genAccountId = createCuid2Generator('account-id', 30);

@Injectable()
export class AccountRepository extends PrismaRepository {
  async createAccountWithPassword(
    payload: AccountCreateWithPasswordPayload,
    options?: PrismaMethodOptions,
  ): Promise<Account> {
    return await this._client(options).account.create({
      data: {
        id: genAccountId(),
        user_id: payload.user_id,
        account_id: payload.user_id,
        provider_id: 'password',
        password: payload.password,
      },
      select: {
        id: true,
        user_id: true,
        password: true,
        access_token: true,
        refresh_token: true,
        access_token_expires_at: true,
        refresh_token_expires_at: true,
        id_token: true,
        scope: true,
        provider_id: true,
        account_id: true,
      },
    });
  }

  async updatePasswordAccount(
    payload: AccountCreateWithPasswordPayload,
    options?: PrismaMethodOptions,
  ): Promise<Account | null> {
    const res = await this._client(options).account.updateManyAndReturn({
      where: {
        user_id: payload.user_id,
        account_id: payload.user_id,
        provider_id: 'password',
      },
      data: {
        password: payload.password,
      },
      select: {
        id: true,
        user_id: true,
        password: true,
        access_token: true,
        refresh_token: true,
        access_token_expires_at: true,
        refresh_token_expires_at: true,
        id_token: true,
        scope: true,
        provider_id: true,
        account_id: true,
      },
    });

    return res.shift() ?? null;
  }

  async createAccountWithSSO(
    payload: AccountCreateWithSSOPayload,
    options?: PrismaMethodOptions,
  ): Promise<Account> {
    return await this._client(options).account.create({
      data: {
        id: genAccountId(),
        user_id: payload.user_id,
        account_id: payload.account_id,
        provider_id: payload.provider_id,
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
        id_token: payload.id_token,
        access_token_expires_at: payload.access_token_expires_at,
        refresh_token_expires_at: payload.refresh_token_expires_at,
        scope: payload.scope,
      },
      select: {
        id: true,
        user_id: true,
        password: true,
        access_token: true,
        refresh_token: true,
        access_token_expires_at: true,
        refresh_token_expires_at: true,
        id_token: true,
        scope: true,
        provider_id: true,
        account_id: true,
      },
    });
  }

  async findPasswordByUserEmail(
    email: User['email'],
    options?: PrismaMethodOptions,
  ) {
    const result = await this._client(options).account.findFirst({
      where: {
        user: { email, deleted_at: null },
        provider_id: 'password',
        password: { not: null },
      },
      select: {
        id: true,
        user_id: true,
        account_id: true,
        provider_id: true,
        password: true,
        access_token: true,
        refresh_token: true,
        id_token: true,
        access_token_expires_at: true,
        refresh_token_expires_at: true,
        scope: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            email_verified: true,
            image: true,
            userRoles: {
              select: {
                user_id: true,
                role_id: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    is_system: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (result?.password) {
      return result as PasswordAccount & { user: MeResult };
    }

    return null;
  }

  async findSSOByAccountId(
    provider_id: Account['provider_id'],
    account_id: Account['account_id'],
    options?: PrismaMethodOptions,
  ) {
    return await this._client(options).account.findFirst({
      where: {
        user: { deleted_at: null },
        provider_id,
        account_id,
      },
      select: {
        id: true,
        user_id: true,
        account_id: true,
        provider_id: true,
        password: true,
        access_token: true,
        refresh_token: true,
        id_token: true,
        access_token_expires_at: true,
        refresh_token_expires_at: true,
        scope: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            email_verified: true,
            image: true,
            callname: true,
            userRoles: {
              select: {
                user_id: true,
                role_id: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    is_system: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
