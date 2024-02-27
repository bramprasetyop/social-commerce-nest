import { IsNotEmpty, IsString } from 'class-validator';

export class UserRequestList {
  @IsString()
  @IsNotEmpty()
  page: string;

  @IsString()
  @IsNotEmpty()
  perPage: string;
}
