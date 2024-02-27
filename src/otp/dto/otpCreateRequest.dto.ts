import { IsNotEmpty, IsString } from 'class-validator';

export class OtpCreateRequest {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  partnerId: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
