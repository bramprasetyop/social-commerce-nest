import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '@src/permissions/permissions.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const { menu, action } = this.reflector.get(
      'permissions',
      context.getHandler()
    );
    if (!menu || !action) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const userMenu = request?.user;
    return this.permissionsService.hasPermission(userMenu, action);
  }
}
