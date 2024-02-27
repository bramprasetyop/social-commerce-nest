import { IsInt, IsNotEmpty, IsString } from 'class-validator';

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
  amount: number;
}
