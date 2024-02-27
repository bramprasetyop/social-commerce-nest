import { ApiHideProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserUpdateRequest {
  @IsString()
  @IsNotEmpty()
  id: string;

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
