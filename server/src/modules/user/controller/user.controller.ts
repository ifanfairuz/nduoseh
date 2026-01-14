import z from 'zod';
import {
  Inject,
  Get,
  UnauthorizedException,
  HttpCode,
  Body,
  Put,
  FileValidator,
} from '@nestjs/common';

import { IFile } from '@nestjs/common/pipes/file/interfaces';
import { UserResponse } from '../response/user.response';
import { ApiController, ApiResponse, Token } from 'src/utils/http';
import type { VerifiedToken } from '@panah/contract';
import { Validation } from 'src/utils/validation';
import { GetUserUseCase } from '../use-case/user/get.user.use-case';
import { UpdateUserUseCase } from '../use-case/user/update.user.use-case';

export class UserImageValidator extends FileValidator {
  constructor() {
    super({});
  }

  isValid(file?: IFile | IFile[]): boolean | Promise<boolean> {
    if (!file) {
      return false;
    }

    if (Array.isArray(file)) {
      return false;
    }

    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
      return false;
    }

    if (file.size > 5_000_000) {
      return false;
    }

    return true;
  }

  buildErrorMessage(): string {
    return 'File must be a jpeg or png image and less than 5MB';
  }
}

const UpdateBody = z.object({
  name: z.string("Name can't be empty").min(1, "Name can't be empty").max(255),
  callname: z
    .string("Callname can't be empty")
    .min(1, "Callname can't be empty")
    .max(20),
});

@ApiController('user', { tag: 'User', auth: true })
export class UserController {
  constructor(
    @Inject() private readonly get: GetUserUseCase,
    @Inject() private readonly update: UpdateUserUseCase,
  ) {}

  /**
   * Get current user
   *
   * @param {VerifiedToken} token
   * @returns {Promise<User>}
   */
  @Get()
  @HttpCode(200)
  @ApiResponse(undefined, {
    status: 200,
    example: UserResponse.example,
  })
  async getUser(@Token() token: VerifiedToken) {
    const res = await this.get.execute(token);
    if (!res) {
      throw new UnauthorizedException();
    }

    return new UserResponse(res);
  }

  /**
   * Update user
   *
   * @param {UpdateBody} body
   * @param {VerifiedToken} token
   * @returns {Promise<User>}
   */
  @Put()
  @HttpCode(200)
  @Validation(UpdateBody)
  @ApiResponse(undefined, {
    status: 200,
    example: UserResponse.example,
  })
  async updateUser(
    @Body() body: z.infer<typeof UpdateBody>,
    @Token() token: VerifiedToken,
  ) {
    const res = await this.update.execute(token, body);
    if (!res) {
      throw new UnauthorizedException();
    }

    return new UserResponse(res);
  }
}
