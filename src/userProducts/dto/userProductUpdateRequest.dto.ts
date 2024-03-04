import { ApiHideProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';

export class UserProductUpdateRequest {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  partnerId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsInt()
  @IsNotEmpty()
  sumAssured: number;

  @IsBoolean()
  @IsNotEmpty()
  isEPolicy: boolean;

  @IsOptional()
  @ApiHideProperty()
  updatedBy?: string;
}
