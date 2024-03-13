import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '@src/auth/auth.permission.decorator';
import { PermissionGuard } from '@src/auth/auth.permission.guard';
import { API_PREFIX, OPEN_API_PREFIX } from '@src/core/constants';
import { RequestHeader } from '@src/core/service/customDecorator/headers';
import { JwtAuthGuard } from '@src/core/service/guard';
import { ParseMessagePipe } from '@src/core/service/kafka/consumer/parse-message.pipe';
import { MapResponseSwagger } from '@src/core/utils/index.utils';

import {
  GenerateLinkCreateRequest,
  GenerateLinkFindAllResponse,
  GenerateLinkRequestList,
  GenerateLinkResponse,
  OpenAPIHeaderRequest,
  VerifyLinkRequest
} from './dto';
import Permission from './generateLinks.enum';
import { GenerateLinkService } from './service/generateLinks.service';

@Controller()
@ApiTags('GenerateLinks')
@ApiBearerAuth()
export class GenerateLinksController {
  constructor(private generateLink: GenerateLinkService) {}

  @MessagePattern('pdf-generator-response-topic')
  pdfGeneratorResponse(@Payload(new ParseMessagePipe()) message): void {
    console.log(message?.convertedData, 'this is pdf-generator-response-topic');
  }

  @Post(`${API_PREFIX}generate-link/send-to-pdf-generator`)
  async sendToPDFGenerator(@Body() body: any): Promise<any> {
    try {
      return await this.generateLink.sendToPDFGenerator(body);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

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
        user?.nip,
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
    @Param('id') id: string,
    @Req() request
  ): Promise<GenerateLinkResponse> {
    try {
      const { user } = request;
      return await this.generateLink.findById(user?.nip, id);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @MapResponseSwagger(GenerateLinkCreateRequest, {
    status: 200,
    isArray: false
  })
  @Post(`${OPEN_API_PREFIX}generate-link`)
  async create(
    @RequestHeader(OpenAPIHeaderRequest) headers: OpenAPIHeaderRequest,
    @Body() body: GenerateLinkCreateRequest
  ): Promise<any> {
    try {
      const {
        'X-TIMESTAMP': timestamp,
        'X-CLIENT-ID': clientId,
        'X-SIGNATURE': signature,
        Authorization: accessToken
      } = headers;

      const generateLinkData = {
        relativeUrl: 'generate-link',
        clientId,
        accessToken,
        signature,
        timestamp
      };
      return await this.generateLink.create(generateLinkData, body);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  @Get(`${API_PREFIX}verify-link`)
  async verifyLink(@Query() query: VerifyLinkRequest): Promise<any> {
    try {
      return await this.generateLink.verifyLink(query?.link);
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
      return await this.generateLink.delete({ deletedBy: user?.nip, id });
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
