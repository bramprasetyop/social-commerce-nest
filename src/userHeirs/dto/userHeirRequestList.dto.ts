import { IsNotEmpty, IsString } from 'class-validator';

export class UserHeirRequestList {
  @IsString()
  @IsNotEmpty()
  page: string;

  @IsString()
  @IsNotEmpty()
  perPage: string;
}
