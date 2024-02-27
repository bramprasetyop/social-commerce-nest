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

import Permission from './claims.enum';
import {
  ClaimCreateRequest,
  ClaimFindAllResponse,
  ClaimRequestList,
  ClaimResponse,
  ClaimUpdateRequest
} from './dto';
import { ClaimsService } from './service/claims.service';

@Controller()
@ApiTags('Claims')
@ApiBearerAuth()
export class ClaimsController {
  constructor(private claim: ClaimsService) {}

  @MapResponseSwagger(ClaimResponse, { status: 200, isArray: true })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('CLAIM', Permission.CLAIM_CAN_VIEW)
  @Get(`${API_PREFIX}claims`)
  async findAll(
    @Query() query: ClaimRequestList,
    @Req() request
  ): Promise<ClaimFindAllResponse> {
    try {
      const { user } = request;
      return await this.claim.findAll(
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
  @MapResponseSwagger(ClaimResponse, { status: 200, isArray: false })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('CLAIM', Permission.CLAIM_CAN_VIEW)
  @Get(`${API_PREFIX}claims/:id`)
  async findDetail(
    @Param('id') id: number,
    @Req() request
  ): Promise<ClaimResponse> {
    try {
      const { user } = request;
      return await this.claim.findById(user?.id_user, id);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @MapResponseSwagger(ClaimCreateRequest, { status: 200, isArray: false })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('CLAIM', Permission.CLAIM_CAN_CREATE)
  @Post(`${API_PREFIX}claims`)
  async create(@Body() body: ClaimCreateRequest, @Req() request): Promise<any> {
    try {
      const { user } = request;
      const jobData = {
        ...body,
        ...{ userId: user?.id_user }
      };
      return await this.claim.create(jobData);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @MapResponseSwagger(ClaimUpdateRequest, { status: 200, isArray: false })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('CLAIM', Permission.CLAIM_CAN_EDIT)
  @Put(`${API_PREFIX}claims`)
  async update(@Body() body: ClaimUpdateRequest, @Req() request): Promise<any> {
    try {
      const { user } = request;
      const jobData = {
        ...body,
        ...{ userId: user?.id_user }
      };

      return await this.claim.update(jobData);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('CLAIM', Permission.CLAIM_CAN_DELETE)
  @Delete(`${API_PREFIX}claims/:id`)
  async delete(@Param('id') id: string, @Req() request): Promise<any> {
    try {
      const { user } = request;
      return await this.claim.delete(user?.id_user, id);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
