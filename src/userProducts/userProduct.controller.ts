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
  UserProductCreateRequest,
  UserProductFindAllResponse,
  UserProductRequestList,
  UserProductResponse,
  UserProductUpdateRequest
} from './dto';
import { UserProductsService } from './service/userProducts.service';
import Permission from './userProducts.enum';

@Controller()
@ApiTags('UserProducts')
@ApiBearerAuth()
export class UserProductsController {
  constructor(private userProduct: UserProductsService) {}

  @MapResponseSwagger(UserProductResponse, { status: 200, isArray: true })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('USERPRODUCT', Permission.USERPRODUCT_CAN_VIEW)
  @Get(`${API_PREFIX}user-products`)
  async findAll(
    @Query() query: UserProductRequestList,
    @Req() request
  ): Promise<UserProductFindAllResponse> {
    try {
      const { user } = request;
      return await this.userProduct.findAll(
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
  @MapResponseSwagger(UserProductResponse, { status: 200, isArray: false })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('USERPRODUCT', Permission.USERPRODUCT_CAN_VIEW)
  @Get(`${API_PREFIX}user-products/:id`)
  async findDetail(
    @Param('id') id: number,
    @Req() request
  ): Promise<UserProductResponse> {
    try {
      const { user } = request;
      return await this.userProduct.findById(user?.id_user, id);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @MapResponseSwagger(UserProductCreateRequest, {
    status: 200,
    isArray: false
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('USERPRODUCT', Permission.USERPRODUCT_CAN_CREATE)
  @Post(`${API_PREFIX}user-products`)
  async create(
    @Body() body: UserProductCreateRequest,
    @Req() request
  ): Promise<any> {
    try {
      const { user } = request;
      const jobData = {
        ...body,
        ...{ userId: user?.id_user }
      };
      return await this.userProduct.create(jobData);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @MapResponseSwagger(UserProductUpdateRequest, {
    status: 200,
    isArray: false
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('USERPRODUCT', Permission.USERPRODUCT_CAN_EDIT)
  @Put(`${API_PREFIX}user-products`)
  async update(
    @Body() body: UserProductUpdateRequest,
    @Req() request
  ): Promise<any> {
    try {
      const { user } = request;
      const jobData = {
        ...body,
        ...{ userId: user?.id_user }
      };

      return await this.userProduct.update(jobData);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('USERPRODUCT', Permission.USERPRODUCT_CAN_DELETE)
  @Delete(`${API_PREFIX}user-products/:id`)
  async delete(@Param('id') id: string, @Req() request): Promise<any> {
    try {
      const { user } = request;
      return await this.userProduct.delete(user?.id_user, id);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
