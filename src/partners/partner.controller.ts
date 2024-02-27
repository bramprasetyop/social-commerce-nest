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
  PartnerCreateRequest,
  PartnerFindAllResponse,
  PartnerRequestList,
  PartnerResponse,
  PartnerUpdateRequest
} from './dto';
import Permission from './partners.enum';
import { PartnersService } from './service/partners.service';

@Controller()
@ApiTags('Partners')
@ApiBearerAuth()
export class PartnersController {
  constructor(private partner: PartnersService) {}

  @MapResponseSwagger(PartnerResponse, { status: 200, isArray: true })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('PARTNER', Permission.PARTNER_CAN_VIEW)
  @Get(`${API_PREFIX}partners`)
  async findAll(
    @Query() query: PartnerRequestList,
    @Req() request
  ): Promise<PartnerFindAllResponse> {
    try {
      const { user } = request;
      return await this.partner.findAll(
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
  @MapResponseSwagger(PartnerResponse, { status: 200, isArray: false })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('PARTNER', Permission.PARTNER_CAN_VIEW)
  @Get(`${API_PREFIX}partners/:id`)
  async findDetail(
    @Param('id') id: number,
    @Req() request
  ): Promise<PartnerResponse> {
    try {
      const { user } = request;
      return await this.partner.findById(user?.id_user, id);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @MapResponseSwagger(PartnerCreateRequest, {
    status: 200,
    isArray: false
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('PARTNER', Permission.PARTNER_CAN_CREATE)
  @Post(`${API_PREFIX}partners`)
  async create(
    @Body() body: PartnerCreateRequest,
    @Req() request
  ): Promise<any> {
    try {
      const { user } = request;
      const jobData = {
        ...body,
        ...{ userId: user?.id_user }
      };
      return await this.partner.create(jobData);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @MapResponseSwagger(PartnerUpdateRequest, {
    status: 200,
    isArray: false
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('PARTNER', Permission.PARTNER_CAN_EDIT)
  @Put(`${API_PREFIX}partners`)
  async update(
    @Body() body: PartnerUpdateRequest,
    @Req() request
  ): Promise<any> {
    try {
      const { user } = request;
      const jobData = {
        ...body,
        ...{ userId: user?.id_user }
      };

      return await this.partner.update(jobData);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('PARTNER', Permission.PARTNER_CAN_DELETE)
  @Delete(`${API_PREFIX}partners/:id`)
  async delete(@Param('id') id: string, @Req() request): Promise<any> {
    try {
      const { user } = request;
      return await this.partner.delete(user?.id_user, id);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
