import { SetMetadata } from '@nestjs/common';

export const Permissions = (menu: string, action: string) =>
  SetMetadata('permissions', { menu, action });
