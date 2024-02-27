import { ApiHideProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator';

export class ClaimUpdateRequest {
  @ApiHideProperty()
  userId?: string;

  @IsInt()
  id: number;

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

  @ApiHideProperty()
  isResubmit?: boolean;

  @ApiHideProperty()
  submitCounter?: number;

  @IsOptional()
  @MaxLength(255)
  @ApiHideProperty()
  noNota?: string;
}
