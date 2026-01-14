import { Injectable } from '@nestjs/common';
import { AuthSession } from '@panah/contract';
import {
  PrismaMethodOptions,
  PrismaRepository,
} from 'src/services/prisma/prisma.repository';
import { createCuid2Generator } from 'src/utils/generator';

export type AuthSessionCreatePayload = Pick<
  AuthSession,
  'user_id' | 'account_id' | 'device_id' | 'ip_address' | 'user_agent'
>;

const genSessionId = createCuid2Generator('session-id', 30);

@Injectable()
export class AuthSessionRepository extends PrismaRepository {
  async create(
    payload: AuthSessionCreatePayload,
    options?: PrismaMethodOptions,
  ): Promise<AuthSession> {
    return this._client(options).authSession.create({
      data: {
        id: genSessionId(),
        user_id: payload.user_id,
        account_id: payload.account_id,
        ip_address: payload.ip_address,
        user_agent: payload.user_agent,
        device_id: payload.device_id,
      },
    });
  }

  async delete(
    id: AuthSession['id'],
    options?: PrismaMethodOptions,
  ): Promise<void> {
    await this._client(options).authSession.delete({
      where: { id },
    });
  }

  async findById(
    id: AuthSession['id'],
    options?: PrismaMethodOptions,
  ): Promise<AuthSession | null> {
    return await this._client(options).authSession.findUnique({
      where: { id },
      select: {
        id: true,
        user_id: true,
        account_id: true,
        ip_address: true,
        user_agent: true,
        device_id: true,
      },
    });
  }
}
