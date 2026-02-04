import {
  Body,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiController, Domain } from 'src/utils/http';
import { Validation } from 'src/utils/validation';
import z from 'zod';
import { AuthGuard } from '../auth.guard';
import { ListUsersUseCase } from '../use-case/user/list-users.use-case';
import { GetUserByIdUseCase } from '../use-case/user/get-user-by-id.use-case';
import { CreateUserUseCase } from '../use-case/user/create-user.use-case';
import { UpdateUserUseCase } from '../use-case/user/update-user.use-case';
import { DeleteUserUseCase } from '../use-case/user/delete-user.use-case';
import type {
  ICreateUserBody,
  IUpdateUserBody,
  OffsetPaginationParams,
} from '@nduoseh/contract';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageProfileValidator } from '../validator/image-profile.validator';

interface ListUsersQuery extends OffsetPaginationParams {
  keyword?: string;
}

const ListUsersQuery = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional(),
  keyword: z.string().max(100, 'Keyword too long').optional(),
  sort: z.array(z.any()).optional(),
});

const CreateUserBody = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  email: z.email('Invalid email').max(255, 'Email too long'),
  callname: z.string().max(20, 'Callname too long').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const UpdateUserBody = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name too long')
    .optional(),
  email: z.email('Invalid email').max(255, 'Email too long').optional(),
  callname: z.string().max(20, 'Callname too long').optional(),
});

@ApiController('users', { tag: 'Users' })
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    @Inject() private readonly listUsersUseCase: ListUsersUseCase,
    @Inject() private readonly getUserByIdUseCase: GetUserByIdUseCase,
    @Inject() private readonly createUserUseCase: CreateUserUseCase,
    @Inject() private readonly updateUserUseCase: UpdateUserUseCase,
    @Inject() private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  /**
   * List all users with offset pagination
   * Query params:
   * - page: page number (default: 1)
   * - limit: items per page (default: 10, max: 100)
   * - keyword: search keyword for name, email, or callname
   */
  @Get()
  @HttpCode(200)
  @Validation(ListUsersQuery, 'query')
  async listUsers(@Query() query: ListUsersQuery, @Domain() domain?: string) {
    return await this.listUsersUseCase.execute(query, domain);
  }

  /**
   * Get user by ID
   */
  @Get(':id')
  @HttpCode(200)
  async getUserById(@Param('id') id: string, @Domain() domain?: string) {
    return this.getUserByIdUseCase.execute(id, domain);
  }

  /**
   * Create new user
   */
  @Post()
  @HttpCode(201)
  @Validation(CreateUserBody)
  @UseInterceptors(FileInterceptor('image'))
  async createUser(
    @Body() body: ICreateUserBody,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new ImageProfileValidator({ optional: true })],
      }),
    )
    image_profile?: Express.Multer.File,
    @Domain() domain?: string,
  ) {
    const image = image_profile
      ? { buffer: image_profile.buffer, mime: image_profile.mimetype }
      : undefined;
    return this.createUserUseCase.execute({ ...body, image }, domain);
  }

  /**
   * Update user
   */
  @Put(':id')
  @HttpCode(200)
  @Validation(UpdateUserBody)
  @UseInterceptors(FileInterceptor('image'))
  async updateUser(
    @Param('id') id: string,
    @Body() body: IUpdateUserBody,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new ImageProfileValidator({ optional: true })],
      }),
    )
    image_profile?: Express.Multer.File,
    @Domain() domain?: string,
  ) {
    const image = image_profile
      ? { buffer: image_profile.buffer, mime: image_profile.mimetype }
      : undefined;
    return this.updateUserUseCase.execute(
      { userId: id, ...body, image },
      domain,
    );
  }

  /**
   * Delete user
   */
  @Delete(':id')
  @HttpCode(200)
  async deleteUser(@Param('id') id: string) {
    return this.deleteUserUseCase.execute(id);
  }

  /**
   * Restore user
   */
  @Post(':id/restore')
  @HttpCode(200)
  async restoreUser(@Param('id') id: string) {
    return this.deleteUserUseCase.restore(id);
  }
}
