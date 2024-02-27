import { IsNotEmpty, IsString } from 'class-validator';

export class PartnerRequestList {
  @IsString()
  @IsNotEmpty()
  page: string;

  @IsString()
  @IsNotEmpty()
  perPage: string;
}
