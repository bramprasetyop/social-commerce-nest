import { ApiHideProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserHeirCreateRequest {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @ApiHideProperty()
  relation?: string;

  @IsOptional()
  @ApiHideProperty()
  name?: string;

  @IsOptional()
  @ApiHideProperty()
  nik?: string;

  @IsOptional()
  @ApiHideProperty()
  dob?: string;

  @IsOptional()
  @ApiHideProperty()
  phoneNo?: string;

  @IsOptional()
  @ApiHideProperty()
  createdBy?: string;
}
