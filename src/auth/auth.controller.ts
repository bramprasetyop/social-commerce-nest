import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { API_PREFIX } from '@src/core/constants';
import { SwaggerMetaResponse } from '@src/core/dto/global.dto';
import { JwtAuthGuard } from '@src/core/service/guard';
import { LoggerService } from '@src/core/service/logger/logger.service';
import { MapResponseSwagger } from '@src/core/utils/index.utils';
import { HttpStatusCode } from 'axios';

import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/auth.dto';

@Controller()
@ApiTags('Auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly logger: LoggerService
  ) {}

  @ApiOperation({ summary: 'Login' })
  @MapResponseSwagger(LoginResponseDto, { status: 200, isArray: false })
  @Post(`${API_PREFIX}login`)
  async login(@Request() req, @Body() body: LoginDto, @Response() res) {
    try {
      const data = await this.authService.login(body);

      return res.status(HttpStatusCode.Ok).json(data);
    } catch (err) {
      this.logger.error(
        'Login User',
        'error ===>',
        JSON.stringify(
          {
            Request: {
              method: req.method,
              url: req.originalUrl
            },
            Error: err.message
          },
          null,
          2
        )
      );
      throw err;
    }
  }

  @ApiOperation({ summary: 'Logout User' })
  @ApiOkResponse({
    status: 200,
    type: SwaggerMetaResponse
  })
  @ApiBearerAuth()
  @Get(`${API_PREFIX}logout`)
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req, @Response() res) {
    try {
      return res.status(HttpStatusCode.Ok).json();
    } catch (err) {
      this.logger.error(
        'Logout user',
        'error ===>',
        JSON.stringify(
          {
            Request: {
              method: req.method,
              url: req.originalUrl,
              body: req.body
            },
            Error: err.message
          },
          null,
          2
        )
      );
      throw err;
    }
  }
}
