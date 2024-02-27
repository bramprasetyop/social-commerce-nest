import { ApiHideProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UserCreateRequest {
  @IsOptional()
  @ApiHideProperty()
  name?: string;

  @IsOptional()
  @ApiHideProperty()
  dob?: string;

  @IsOptional()
  @ApiHideProperty()
  address?: string;

  @IsOptional()
  @ApiHideProperty()
  email?: string;

  @IsOptional()
  @ApiHideProperty()
  nik?: string;

  @IsOptional()
  @ApiHideProperty()
  telpNo?: string;
}
