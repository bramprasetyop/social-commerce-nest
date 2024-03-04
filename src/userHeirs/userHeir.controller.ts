import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '@src/auth/auth.permission.decorator';
import { PermissionGuard } from '@src/auth/auth.permission.guard';
import { API_PREFIX } from '@src/core/constants';
import { JwtAuthGuard } from '@src/core/service/guard';
import { MapResponseSwagger } from '@src/core/utils/index.utils';

import {
  UserHeirCreateRequest,
  UserHeirFindAllResponse,
  UserHeirRequestList,
  UserHeirResponse,
  UserHeirUpdateRequest
} from './dto';
import { UserHeirsService } from './service/userHeirs.service';
import Permission from './userHeirs.enum';

@Controller(`${API_PREFIX}user-heirs`)
@ApiTags('User Heirs')
@ApiBearerAuth()
export class UserHeirsController {
  constructor(private user: UserHeirsService) {}

  @MapResponseSwagger(UserHeirResponse, { status: 200, isArray: true })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('USERHEIRS', Permission.USERHEIRS_CAN_VIEW)
  @Get()
  async findAll(
    @Query() query: UserHeirRequestList,
    @Req() request
  ): Promise<UserHeirFindAllResponse> {
    try {
      const { user } = request;
      return await this.user.findAll(user?.nip, +query?.page, +query?.perPage);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @ApiOkResponse({
    schema: {
      example: {
        statusCode: 200,
        message: 'sukses',
        error: ''
      }
    }
  })
  @MapResponseSwagger(UserHeirResponse, { status: 200, isArray: false })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('USERHEIRS', Permission.USERHEIRS_CAN_VIEW)
  @Get(':id')
  async findDetail(
    @Param('id') id: string,
    @Req() request
  ): Promise<UserHeirResponse> {
    try {
      const { user } = request;
      return await this.user.findById(user?.nip, id);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @MapResponseSwagger(UserHeirCreateRequest, {
    status: 200,
    isArray: false
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('USERHEIRS', Permission.USERHEIRS_CAN_CREATE)
  @Post()
  async create(
    @Body() body: UserHeirCreateRequest,
    @Req() request
  ): Promise<any> {
    try {
      const { user } = request;
      const jobData = {
        ...body,
        ...{ createdBy: user?.nip }
      };
      return await this.user.create(jobData);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @MapResponseSwagger(UserHeirUpdateRequest, {
    status: 200,
    isArray: false
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('USERHEIRS', Permission.USERHEIRS_CAN_EDIT)
  @Put()
  async update(
    @Body() body: UserHeirUpdateRequest,
    @Req() request
  ): Promise<any> {
    try {
      const { user } = request;
      const jobData = {
        ...body,
        ...{ updatedBy: user?.nip }
      };

      return await this.user.update(jobData);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('USERHEIRS', Permission.USERHEIRS_CAN_DELETE)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() request): Promise<any> {
    try {
      const { user } = request;
      return await this.user.delete(user?.nip, id);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
