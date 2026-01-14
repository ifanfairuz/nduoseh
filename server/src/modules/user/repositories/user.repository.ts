import { Injectable } from '@nestjs/common';
import {
  PrismaMethodOptions,
  PrismaRepository,
} from 'src/services/prisma/prisma.repository';
import { User } from '@panah/contract';
import { EmailAlreadyExistsException } from '../exceptions/EmailAlreadyExistsException';
import { createCuid2Generator } from 'src/utils/generator';

export type UserCreatePayload = Pick<User, 'name' | 'email'> &
  Partial<Pick<User, 'image' | 'email_verified' | 'callname'>>;

export type UserUpdatePayload = Partial<Omit<User, 'id'>>;

const genUserId = createCuid2Generator('user-id', 24);

@Injectable()
export class UserRepository extends PrismaRepository {
  async create(payload: UserCreatePayload, options?: PrismaMethodOptions) {
    const client = this._client(options);

    const exists = await client.user.findFirst({
      where: { email: payload.email, deleted_at: null },
      select: { id: true },
    });

    if (exists) {
      throw new EmailAlreadyExistsException(payload.email);
    }

    return await client.user.create({
      data: {
        id: genUserId(),
        name: payload.name,
        email: payload.email,
        email_verified: payload.email_verified,
        image: payload.image,
        callname: payload.callname,
      },
      select: {
        id: true,
        name: true,
        email: true,
        email_verified: true,
        image: true,
        callname: true,
      },
    });
  }

  async update(
    id: User['id'],
    payload: UserUpdatePayload,
    options?: PrismaMethodOptions,
  ) {
    return await this._client(options).user.update({
      where: { id, deleted_at: null },
      data: {
        name: payload.name,
        email: payload.email,
        email_verified: payload.email_verified,
        image: payload.image,
        callname: payload.callname,
      },
      select: {
        id: true,
        name: true,
        email: true,
        email_verified: true,
        image: true,
        callname: true,
      },
    });
  }

  async delete(id: User['id'], options?: PrismaMethodOptions) {
    await this._client(options).user.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findById(id: User['id'], options?: PrismaMethodOptions) {
    return await this._client(options).user.findUnique({
      where: { id, deleted_at: null },
      select: {
        id: true,
        name: true,
        email: true,
        email_verified: true,
        image: true,
        callname: true,
      },
    });
  }

  async findByEmail(email: User['email'], options?: PrismaMethodOptions) {
    return await this._client(options).user.findFirst({
      where: { email, deleted_at: null },
      select: {
        id: true,
        name: true,
        email: true,
        email_verified: true,
        image: true,
        callname: true,
      },
    });
  }
}
