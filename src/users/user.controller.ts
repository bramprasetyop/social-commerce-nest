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
  SubmitUserCreateRequest,
  UserCreateRequest,
  UserFindAllResponse,
  UserRequestList,
  UserResponse,
  UserUpdateRequest
} from './dto';
import { UsersService } from './service/users.service';
import Permission from './users.enum';

@Controller()
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(private user: UsersService) {}

  @MapResponseSwagger(UserResponse, { status: 200, isArray: true })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('USER', Permission.USER_CAN_VIEW)
  @Get(`${API_PREFIX}users`)
  async findAll(
    @Query() query: UserRequestList,
    @Req() request
  ): Promise<UserFindAllResponse> {
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
  @MapResponseSwagger(UserResponse, { status: 200, isArray: false })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('USER', Permission.USER_CAN_VIEW)
  @Get(`${API_PREFIX}users/:id`)
  async findDetail(
    @Param('id') id: string,
    @Req() request
  ): Promise<UserResponse> {
    try {
      const { user } = request;
      return await this.user.findById(user?.nip, id);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @MapResponseSwagger(UserCreateRequest, {
    status: 200,
    isArray: false
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('USER', Permission.USER_CAN_CREATE)
  @Post(`${API_PREFIX}users`)
  async create(@Body() body: UserCreateRequest, @Req() request): Promise<any> {
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

  @Post(`${API_PREFIX}user-submit`)
  async submit(@Body() body: SubmitUserCreateRequest): Promise<any> {
    try {
      return await this.user.submit(body);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @MapResponseSwagger(UserUpdateRequest, {
    status: 200,
    isArray: false
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('USER', Permission.USER_CAN_EDIT)
  @Put(`${API_PREFIX}users`)
  async update(@Body() body: UserUpdateRequest, @Req() request): Promise<any> {
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
  @Permissions('USER', Permission.USER_CAN_DELETE)
  @Delete(`${API_PREFIX}users/:id`)
  async delete(@Param('id') id: string, @Req() request): Promise<any> {
    try {
      const { user } = request;
      return await this.user.delete(user?.nip, id);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
