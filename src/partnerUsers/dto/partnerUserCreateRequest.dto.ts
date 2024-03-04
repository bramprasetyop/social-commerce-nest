import { ApiHideProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PartnerUserCreateRequest {
  @IsString()
  @IsNotEmpty()
  partnerId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNo: string;

  @IsOptional()
  @ApiHideProperty()
  isActive?: boolean;

  @IsOptional()
  @ApiHideProperty()
  createdBy?: string;
}
