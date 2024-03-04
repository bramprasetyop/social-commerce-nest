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
  OtpCreateRequest,
  OtpFindAllResponse,
  OtpRequestList,
  OtpResponse,
  OtpUpdateRequest
} from './dto';
import Permission from './otp.enum';
import { OtpsService } from './service/otps.service';

@Controller()
@ApiTags('Otps')
@ApiBearerAuth()
export class OtpsController {
  constructor(private otp: OtpsService) {}

  @MapResponseSwagger(OtpResponse, { status: 200, isArray: true })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('OTP', Permission.OTP_CAN_VIEW)
  @Get(`${API_PREFIX}otp`)
  async findAll(
    @Query() query: OtpRequestList,
    @Req() request
  ): Promise<OtpFindAllResponse> {
    try {
      const { user } = request;
      return await this.otp.findAll(user?.nip, +query?.page, +query?.perPage);
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
  @MapResponseSwagger(OtpResponse, { status: 200, isArray: false })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('OTP', Permission.OTP_CAN_VIEW)
  @Get(`${API_PREFIX}otp/:id`)
  async findDetail(
    @Param('id') id: string,
    @Req() request
  ): Promise<OtpResponse> {
    try {
      const { user } = request;
      return await this.otp.findById(user?.nip, id);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @MapResponseSwagger(OtpCreateRequest, {
    status: 200,
    isArray: false
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('OTP', Permission.OTP_CAN_CREATE)
  @Post(`${API_PREFIX}otp`)
  async create(@Body() body: OtpCreateRequest, @Req() request): Promise<any> {
    try {
      const { user } = request;
      const jobData = {
        ...body,
        ...{ createdBy: user?.nip }
      };
      return await this.otp.create(jobData);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @MapResponseSwagger(OtpUpdateRequest, {
    status: 200,
    isArray: false
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('OTP', Permission.OTP_CAN_EDIT)
  @Put(`${API_PREFIX}otp`)
  async update(@Body() body: OtpUpdateRequest, @Req() request): Promise<any> {
    try {
      const { user } = request;
      const jobData = {
        ...body,
        ...{ updatedBy: user?.nip }
      };

      return await this.otp.update(jobData);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('OTP', Permission.OTP_CAN_DELETE)
  @Delete(`${API_PREFIX}otp/:id`)
  async delete(@Param('id') id: string, @Req() request): Promise<any> {
    try {
      const { user } = request;
      return await this.otp.delete({ deletedBy: user?.nip, id });
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
