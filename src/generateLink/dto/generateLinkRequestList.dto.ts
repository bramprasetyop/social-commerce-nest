import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateLinkRequestList {
  @IsString()
  @IsNotEmpty()
  page: string;

  @IsString()
  @IsNotEmpty()
  perPage: string;
}
