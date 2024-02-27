import { ApiHideProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateLinkUpdateRequest {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  partnerId: string;

  @IsString()
  @IsNotEmpty()
  partnerUserId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @ApiHideProperty()
  link?: string;

  @IsString()
  @IsNotEmpty()
  createdBy: string;
}
