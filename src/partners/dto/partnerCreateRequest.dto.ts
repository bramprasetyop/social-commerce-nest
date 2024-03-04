import { ApiHideProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PartnerCreateRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @ApiHideProperty()
  createdBy?: string;
}
