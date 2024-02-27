import { IsNotEmpty, IsString } from 'class-validator';

export class ClaimRequestList {
  @IsString()
  @IsNotEmpty()
  page: string;

  @IsString()
  @IsNotEmpty()
  perPage: string;
}
