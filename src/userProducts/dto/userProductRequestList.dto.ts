import { IsNotEmpty, IsString } from 'class-validator';

export class UserProductRequestList {
  @IsString()
  @IsNotEmpty()
  page: string;

  @IsString()
  @IsNotEmpty()
  perPage: string;
}
