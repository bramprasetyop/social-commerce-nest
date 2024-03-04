import { ApiHideProperty } from '@nestjs/swagger';
import { UserCreateRequest } from '@src/users/dto/userCreateRequest.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateLinkCreateRequest extends UserCreateRequest {
  @IsString()
  @IsNotEmpty()
  partnerId: string;

  @IsString()
  @IsNotEmpty()
  partnerUserId: string;

  @IsOptional()
  @ApiHideProperty()
  userId?: string;

  @IsOptional()
  @ApiHideProperty()
  link?: string;

  @IsOptional()
  @ApiHideProperty()
  createdBy?: string;
}
