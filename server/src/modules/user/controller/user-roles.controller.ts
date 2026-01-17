import {
  Body,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiController } from 'src/utils/http';
import { Validation } from 'src/utils/validation';
import z from 'zod';
import { AuthGuard } from '../auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { AssignRoleUseCase } from '../use-case/user-role/assign-role.use-case';
import { RemoveRoleUseCase } from '../use-case/user-role/remove-role.use-case';
import { GetUserRolesUseCase } from '../use-case/user-role/get-user-roles.use-case';
import { GetUserPermissionsUseCase } from '../use-case/user-role/get-user-permissions.use-case';

const AssignRoleBody = z.object({
  roleId: z.string().length(24, 'Invalid role ID'),
});

@ApiController('users/:userId/roles', { tag: 'User Roles' })
@UseGuards(AuthGuard, PermissionsGuard)
export class UserRolesController {
  constructor(
    @Inject() private readonly assignRole: AssignRoleUseCase,
    @Inject() private readonly removeRole: RemoveRoleUseCase,
    @Inject() private readonly getUserRoles: GetUserRolesUseCase,
    @Inject() private readonly getUserPermissions: GetUserPermissionsUseCase,
  ) {}

  /**
   * Get user's roles
   */
  @Get()
  @HttpCode(200)
  @RequirePermissions('users.roles.list')
  async getRoles(@Param('userId') userId: string) {
    return this.getUserRoles.execute(userId);
  }

  /**
   * Get user's aggregated permissions
   */
  @Get('permissions')
  @HttpCode(200)
  @RequirePermissions('users.roles.list')
  async getPermissions(@Param('userId') userId: string) {
    return this.getUserPermissions.execute(userId);
  }

  /**
   * Assign role to user
   */
  @Post()
  @HttpCode(201)
  @RequirePermissions('users.roles.assign')
  @Validation(AssignRoleBody)
  async assign(
    @Param('userId') userId: string,
    @Body() body: z.infer<typeof AssignRoleBody>,
  ) {
    return this.assignRole.execute({ userId, roleId: body.roleId });
  }

  /**
   * Remove role from user
   */
  @Delete(':roleId')
  @HttpCode(200)
  @RequirePermissions('users.roles.remove')
  async remove(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.removeRole.execute({ userId, roleId });
  }
}
