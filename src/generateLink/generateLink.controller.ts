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
  GenerateLinkCreateRequest,
  GenerateLinkFindAllResponse,
  GenerateLinkRequestList,
  GenerateLinkResponse,
  GenerateLinkUpdateRequest
} from './dto';
import Permission from './generateLinks.enum';
import { GenerateLinkService } from './service/generateLinks.service';

@Controller()
@ApiTags('GenerateLinks')
@ApiBearerAuth()
export class GenerateLinksController {
  constructor(private generateLink: GenerateLinkService) {}

  @MapResponseSwagger(GenerateLinkResponse, { status: 200, isArray: true })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('GENERATELINK', Permission.GENERATELINK_CAN_VIEW)
  @Get(`${API_PREFIX}generate-link`)
  async findAll(
    @Query() query: GenerateLinkRequestList,
    @Req() request
  ): Promise<GenerateLinkFindAllResponse> {
    try {
      const { user } = request;
      return await this.generateLink.findAll(
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
  @MapResponseSwagger(GenerateLinkResponse, { status: 200, isArray: false })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('GENERATELINK', Permission.GENERATELINK_CAN_VIEW)
  @Get(`${API_PREFIX}generate-link/:id`)
  async findDetail(
    @Param('id') id: number,
    @Req() request
  ): Promise<GenerateLinkResponse> {
    try {
      const { user } = request;
      return await this.generateLink.findById(user?.id_user, id);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @MapResponseSwagger(GenerateLinkCreateRequest, {
    status: 200,
    isArray: false
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('GENERATELINK', Permission.GENERATELINK_CAN_CREATE)
  @Post(`${API_PREFIX}generate-link`)
  async create(
    @Body() body: GenerateLinkCreateRequest,
    @Req() request
  ): Promise<any> {
    try {
      const { user } = request;
      const jobData = {
        ...body,
        ...{ userId: user?.id_user }
      };
      return await this.generateLink.create(jobData);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @MapResponseSwagger(GenerateLinkUpdateRequest, {
    status: 200,
    isArray: false
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('GENERATELINK', Permission.GENERATELINK_CAN_EDIT)
  @Put(`${API_PREFIX}generate-link`)
  async update(
    @Body() body: GenerateLinkUpdateRequest,
    @Req() request
  ): Promise<any> {
    try {
      const { user } = request;
      const jobData = {
        ...body,
        ...{ userId: user?.id_user }
      };

      return await this.generateLink.update(jobData);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('GENERATELINK', Permission.GENERATELINK_CAN_DELETE)
  @Delete(`${API_PREFIX}generate-link/:id`)
  async delete(@Param('id') id: string, @Req() request): Promise<any> {
    try {
      const { user } = request;
      return await this.generateLink.delete(user?.id_user, id);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
