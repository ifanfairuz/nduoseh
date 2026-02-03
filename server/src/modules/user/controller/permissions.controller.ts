import { Get, HttpCode, Inject, UseGuards } from '@nestjs/common';
import { ApiController } from 'src/utils/http';
import { AuthGuard } from '../auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { GetAvailablePermissionsUseCase } from '../use-case/permissions/get-available-permissions.use-case';

@ApiController('permissions', { tag: 'Permissions' })
@UseGuards(AuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(
    @Inject()
    private readonly getAvailablePermissionsUseCase: GetAvailablePermissionsUseCase,
  ) {}

  /**
   * Get all available permissions in the system
   * Returns permissions grouped by resource for easy UI rendering
   */
  @Get()
  @HttpCode(200)
  @RequirePermissions('roles.list')
  getAvailablePermissions() {
    return this.getAvailablePermissionsUseCase.execute();
  }
}
