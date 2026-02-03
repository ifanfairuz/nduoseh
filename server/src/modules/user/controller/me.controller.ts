import z from 'zod';
import {
  Inject,
  Get,
  UnauthorizedException,
  HttpCode,
  Body,
  Put,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
} from '@nestjs/common';

import { MeResponse } from '../response/user.response';
import { ApiController, ApiResponse, Token, Domain } from 'src/utils/http';
import type { IUpdateMeBody, VerifiedToken } from '@panah/contract';
import { Validation } from 'src/utils/validation';
import { GetMeUseCase } from '../use-case/me/get-me.user.use-case';
import { UpdateMeUseCase } from '../use-case/me/update.me.use-case';
import { UpdateImageMeUseCase } from '../use-case/me/update-image.me.use-case';
import { UserImageDisk } from '../storage/user-image.disk';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageProfileValidator } from '../validator/image-profile.validator';

const UpdateBody = z.object({
  email: z.email(),
  name: z.string("Name can't be empty").min(1, "Name can't be empty").max(255),
  callname: z
    .string("Callname can't be empty")
    .min(1, "Callname can't be empty")
    .max(20),
});

@ApiController('me', { tag: 'User', auth: true })
export class MeController {
  constructor(
    @Inject() private readonly get: GetMeUseCase,
    @Inject() private readonly update: UpdateMeUseCase,
    @Inject() private readonly updateImage: UpdateImageMeUseCase,
    @Inject() private readonly disk: UserImageDisk,
  ) {}

  /**
   * Get current user
   *
   * @param {VerifiedToken} token
   * @returns {Promise<User>}
   */
  @Get()
  @HttpCode(200)
  @ApiResponse(MeResponse, {
    status: 200,
  })
  async getUser(@Token() token: VerifiedToken, @Domain() domain: string) {
    const res = await this.get.execute(token);
    if (!res) {
      throw new UnauthorizedException();
    }

    return await MeResponse.withImageUrl(
      res.user,
      this.disk,
      domain,
      res.permissions,
      res.modules,
    );
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
  @ApiResponse(MeResponse, {
    status: 200,
  })
  async updateUser(
    @Body() body: IUpdateMeBody,
    @Token() token: VerifiedToken,
    @Domain() domain: string,
  ) {
    const res = await this.update.execute(token, body);
    if (!res) {
      throw new UnauthorizedException();
    }

    return await MeResponse.withImageUrl(
      res.user,
      this.disk,
      domain,
      res.permissions,
      res.modules,
    );
  }

  /**
   * Update user image
   *
   * @param uploadedFile
   * @param {VerifiedToken} token
   * @returns {Promise<User>}
   */
  @Post('image')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('image'))
  @ApiResponse(MeResponse, {
    status: 200,
  })
  async updateUserImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new ImageProfileValidator()],
      }),
    )
    image: Express.Multer.File,
    @Token() token: VerifiedToken,
    @Domain() domain: string,
  ) {
    const res = await this.updateImage.execute(
      token,
      image.buffer,
      image.mimetype,
    );
    if (!res) {
      throw new UnauthorizedException();
    }

    return await MeResponse.withImageUrl(
      res.user,
      this.disk,
      domain,
      res.permissions,
      res.modules,
    );
  }
}
