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
  phoneNo?: string;

  @IsOptional()
  @ApiHideProperty()
  occupation?: string;

  @IsOptional()
  @ApiHideProperty()
  city?: string;

  @IsOptional()
  @ApiHideProperty()
  zipCode?: string;

  @IsOptional()
  @ApiHideProperty()
  maritalStatus?: string;

  @IsOptional()
  @ApiHideProperty()
  gender?: string;

  @IsOptional()
  @ApiHideProperty()
  idCardPhoto?: string;

  @IsOptional()
  @ApiHideProperty()
  selfiePhoto?: string;

  @IsOptional()
  @ApiHideProperty()
  createdBy?: string;
}
