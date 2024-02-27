import { IsNotEmpty, IsString } from 'class-validator';

export class OtpRequestList {
  @IsString()
  @IsNotEmpty()
  page: string;

  @IsString()
  @IsNotEmpty()
  perPage: string;
}
