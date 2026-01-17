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
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { CreateRoleUseCase } from '../use-case/role/create-role.use-case';
import { UpdateRoleUseCase } from '../use-case/role/update-role.use-case';
import { DeleteRoleUseCase } from '../use-case/role/delete-role.use-case';
import { GetRoleByIdUseCase } from '../use-case/role/get-role-by-id.use-case';
import { ListRolesUseCase } from '../use-case/role/list-roles.use-case';

const CreateRoleBody = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug too long'),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'At least one permission required'),
});

const UpdateRoleBody = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

@ApiController('roles', { tag: 'Roles' })
@UseGuards(AuthGuard, PermissionsGuard)
export class RolesController {
  constructor(
    @Inject() private readonly createRole: CreateRoleUseCase,
    @Inject() private readonly updateRole: UpdateRoleUseCase,
    @Inject() private readonly deleteRole: DeleteRoleUseCase,
    @Inject() private readonly getRoleById: GetRoleByIdUseCase,
    @Inject() private readonly listRoles: ListRolesUseCase,
  ) {}

  /**
   * List all roles
   */
  @Get()
  @HttpCode(200)
  @RequirePermissions('roles.list')
  async list() {
    return this.listRoles.execute();
  }

  /**
   * Get role by ID
   */
  @Get(':id')
  @HttpCode(200)
  @RequirePermissions('roles.list')
  async getById(@Param('id') id: string) {
    return this.getRoleById.execute(id);
  }

  /**
   * Create new role
   */
  @Post()
  @HttpCode(201)
  @RequirePermissions('roles.create')
  @Validation(CreateRoleBody)
  async create(@Body() body: z.infer<typeof CreateRoleBody>) {
    return this.createRole.execute(body);
  }

  /**
   * Update role
   */
  @Put(':id')
  @HttpCode(200)
  @RequirePermissions('roles.update')
  @Validation(UpdateRoleBody)
  async update(
    @Param('id') id: string,
    @Body() body: z.infer<typeof UpdateRoleBody>,
  ) {
    return this.updateRole.execute({ roleId: id, ...body });
  }

  /**
   * Delete role
   */
  @Delete(':id')
  @HttpCode(200)
  @RequirePermissions('roles.delete')
  async delete(@Param('id') id: string) {
    return this.deleteRole.execute(id);
  }
}
