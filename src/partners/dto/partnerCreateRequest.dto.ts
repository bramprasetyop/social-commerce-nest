import { IsNotEmpty, IsString } from 'class-validator';

export class PartnerCreateRequest {
  @IsString()
  @IsNotEmpty()
  name: string;
}
