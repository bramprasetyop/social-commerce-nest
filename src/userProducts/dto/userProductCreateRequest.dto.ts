import { IsDate, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UserProductCreateRequest {
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
  amount: number;

  @IsDate()
  @IsNotEmpty()
  expired: Date;
}
