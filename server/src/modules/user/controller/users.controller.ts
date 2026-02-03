import {
  Body,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiController } from 'src/utils/http';
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
} from '@panah/contract';

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
  async listUsers(@Query() query: ListUsersQuery) {
    return await this.listUsersUseCase.execute(query);
  }

  /**
   * Get user by ID
   */
  @Get(':id')
  @HttpCode(200)
  async getUserById(@Param('id') id: string) {
    return this.getUserByIdUseCase.execute(id);
  }

  /**
   * Create new user
   */
  @Post()
  @HttpCode(201)
  @Validation(CreateUserBody)
  async createUser(@Body() body: ICreateUserBody) {
    return this.createUserUseCase.execute(body);
  }

  /**
   * Update user
   */
  @Put(':id')
  @HttpCode(200)
  @Validation(UpdateUserBody)
  async updateUser(@Param('id') id: string, @Body() body: IUpdateUserBody) {
    return this.updateUserUseCase.execute({ userId: id, ...body });
  }

  /**
   * Delete user
   */
  @Delete(':id')
  @HttpCode(200)
  async deleteUser(@Param('id') id: string) {
    return this.deleteUserUseCase.execute(id);
  }
}
