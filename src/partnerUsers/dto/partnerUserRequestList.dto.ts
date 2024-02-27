import { IsNotEmpty, IsString } from 'class-validator';

export class PartnerUserRequestList {
  @IsString()
  @IsNotEmpty()
  page: string;

  @IsString()
  @IsNotEmpty()
  perPage: string;
}
