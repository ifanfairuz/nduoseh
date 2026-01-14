import { Injectable } from '@nestjs/common';
import { AuthProviderClientId } from '@panah/contract';
import {
  PrismaMethodOptions,
  PrismaRepository,
} from 'src/services/prisma/prisma.repository';

export type AuthProviderClientIdCreatePayload = Pick<
  AuthProviderClientId,
  'provider' | 'client_id' | 'secret' | 'tags'
>;

export type AuthProviderClientIdUpdatePayload = Partial<
  Omit<AuthProviderClientId, 'id'>
>;

@Injectable()
export class AuthProviderClientIdRepository extends PrismaRepository {
  async create(
    payload: AuthProviderClientIdCreatePayload,
    options?: PrismaMethodOptions,
  ): Promise<AuthProviderClientId> {
    const result = await this._client(options).authProviderClientId.create({
      data: {
        provider: payload.provider,
        client_id: payload.client_id,
        secret: payload.secret,
        active: true,
        tags: payload.tags,
      },
      select: {
        id: true,
        provider: true,
        client_id: true,
        secret: true,
        active: true,
        tags: true,
      },
    });

    return result as AuthProviderClientId;
  }

  async update(
    id: AuthProviderClientId['id'],
    payload: AuthProviderClientIdUpdatePayload,
    options?: PrismaMethodOptions,
  ): Promise<AuthProviderClientId> {
    const result = await this._client(options).authProviderClientId.update({
      where: { id },
      data: {
        provider: payload.provider,
        client_id: payload.client_id,
        secret: payload.secret,
        active: payload.active,
        tags: payload.tags,
      },
      select: {
        id: true,
        provider: true,
        client_id: true,
        secret: true,
        active: true,
        tags: true,
      },
    });

    return result as AuthProviderClientId;
  }

  async delete(
    id: AuthProviderClientId['id'],
    options?: PrismaMethodOptions,
  ): Promise<void> {
    await this._client(options).authProviderClientId.delete({
      where: { id },
    });
  }

  async getActiveByProvider(
    provider: AuthProviderClientId['provider'],
    options?: PrismaMethodOptions,
  ): Promise<AuthProviderClientId[]> {
    const result = await this._client(options).authProviderClientId.findMany({
      where: { provider, active: true },
      select: {
        id: true,
        provider: true,
        client_id: true,
        secret: true,
        active: true,
        tags: true,
      },
    });

    return result as AuthProviderClientId[];
  }
}
