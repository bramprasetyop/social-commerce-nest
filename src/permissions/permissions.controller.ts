import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { API_PREFIX } from '@src/core/constants';

import { PermissionsService } from './permissions.service';

@Controller()
export class PermissionsController {
  constructor(private permission: PermissionsService) {}

  @Get(`${API_PREFIX}permissions`)
  async findAll(): Promise<any> {
    try {
      return await this.permission.findAll();
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
