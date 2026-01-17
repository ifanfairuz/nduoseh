import {
  Body,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
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
import type { ICreateUserBody, IUpdateUserBody } from '@panah/contract';

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
   * List all users
   */
  @Get()
  @HttpCode(200)
  async listUsers() {
    return this.listUsersUseCase.execute();
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
