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
  PartnerUserCreateRequest,
  PartnerUserFindAllResponse,
  PartnerUserRequestList,
  PartnerUserResponse,
  PartnerUserUpdateRequest
} from './dto';
import Permission from './partnerUsers.enum';
import { PartnerUsersService } from './service/partnerUsers.service';

@Controller()
@ApiTags('PartnerUsers')
@ApiBearerAuth()
export class PartnerUsersController {
  constructor(private partnerUser: PartnerUsersService) {}

  @MapResponseSwagger(PartnerUserResponse, { status: 200, isArray: true })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('PARTNERUSER', Permission.PARTNERUSER_CAN_VIEW)
  @Get(`${API_PREFIX}partner-user`)
  async findAll(
    @Query() query: PartnerUserRequestList,
    @Req() request
  ): Promise<PartnerUserFindAllResponse> {
    try {
      const { user } = request;
      return await this.partnerUser.findAll(
        user?.id_user,
        +query?.page,
        +query?.perPage
      );
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
  @MapResponseSwagger(PartnerUserResponse, { status: 200, isArray: false })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('PARTNERUSER', Permission.PARTNERUSER_CAN_VIEW)
  @Get(`${API_PREFIX}partner-user/:id`)
  async findDetail(
    @Param('id') id: number,
    @Req() request
  ): Promise<PartnerUserResponse> {
    try {
      const { user } = request;
      return await this.partnerUser.findById(user?.id_user, id);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @MapResponseSwagger(PartnerUserCreateRequest, {
    status: 200,
    isArray: false
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('PARTNERUSER', Permission.PARTNERUSER_CAN_CREATE)
  @Post(`${API_PREFIX}partner-user`)
  async create(
    @Body() body: PartnerUserCreateRequest,
    @Req() request
  ): Promise<any> {
    try {
      const { user } = request;
      const jobData = {
        ...body,
        ...{ userId: user?.id_user }
      };
      return await this.partnerUser.create(jobData);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @MapResponseSwagger(PartnerUserUpdateRequest, {
    status: 200,
    isArray: false
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('PARTNERUSER', Permission.PARTNERUSER_CAN_EDIT)
  @Put(`${API_PREFIX}partner-user`)
  async update(
    @Body() body: PartnerUserUpdateRequest,
    @Req() request
  ): Promise<any> {
    try {
      const { user } = request;
      const jobData = {
        ...body,
        ...{ userId: user?.id_user }
      };

      return await this.partnerUser.update(jobData);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('PARTNERUSER', Permission.PARTNERUSER_CAN_DELETE)
  @Delete(`${API_PREFIX}partner-user/:id`)
  async delete(@Param('id') id: string, @Req() request): Promise<any> {
    try {
      const { user } = request;
      return await this.partnerUser.delete(user?.id_user, id);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
