import { ApiHideProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateLinkCreateRequest {
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
