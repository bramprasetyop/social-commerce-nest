import { ApiHideProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator';

export class ClaimCreateRequest {
  @ApiHideProperty()
  userId?: string;

  @ApiHideProperty()
  id?: number;

  @IsOptional()
  @MaxLength(255)
  @ApiHideProperty()
  noKlaim?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  noTertanggung: string;

  @ApiHideProperty()
  tanggalPeriksa?: Date;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  namaTertanggung: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  namaKaryawan: string;

  @IsString()
  @IsNotEmpty()
  plan: string;

  @IsInt()
  totalKlaim: number;

  @IsString()
  @IsNotEmpty()
  statusSubmit: string;

  @ApiHideProperty()
  cutoffDate?: Date;

  @IsOptional()
  @MaxLength(255)
  @ApiHideProperty()
  noNota?: string;
}
