import { Injectable } from '@nestjs/common';
import { AuthSession, RefreshToken } from '@nduoseh/contract';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
  PrismaMethodOptions,
  PrismaRepository,
} from 'src/services/prisma/prisma.repository';

export type RefreshTokenCreatePayload = Pick<
  RefreshToken,
  'id' | 'session_id' | 'token_hash' | 'expires_at'
>;

@Injectable()
export class RefreshTokenRepository extends PrismaRepository {
  async store(
    payload: RefreshTokenCreatePayload,
    options?: PrismaMethodOptions,
  ): Promise<RefreshToken> {
    return await this._client(options).refreshToken.create({
      data: {
        id: payload.id,
        session_id: payload.session_id,
        token_hash: payload.token_hash,
        is_used: false,
        expires_at: payload.expires_at,
      },
      select: {
        id: true,
        session_id: true,
        token_hash: true,
        is_used: true,
        expires_at: true,
      },
    });
  }

  async findById(
    id: RefreshToken['id'],
    options?: PrismaMethodOptions,
  ): Promise<RefreshToken | null> {
    return await this._client(options).refreshToken.findUnique({
      where: { id },
      select: {
        id: true,
        session_id: true,
        token_hash: true,
        is_used: true,
        expires_at: true,
      },
    });
  }

  async setUsed(
    id: RefreshToken['id'],
    options?: PrismaMethodOptions,
  ): Promise<RefreshToken | null> {
    try {
      return await this._client(options).refreshToken.update({
        where: { id },
        data: { is_used: true },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }

      throw error;
    }
  }

  async delete(
    id: RefreshToken['id'],
    options?: PrismaMethodOptions,
  ): Promise<void> {
    await this._client(options).refreshToken.delete({
      where: { id },
    });
  }

  async invalidateForSessionId(
    id: AuthSession['id'],
    options?: PrismaMethodOptions,
  ): Promise<void> {
    await this._client(options).refreshToken.deleteMany({
      where: { session_id: id, is_used: false },
    });
  }
}
