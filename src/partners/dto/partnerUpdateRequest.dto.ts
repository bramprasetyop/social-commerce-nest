import { IsNotEmpty, IsString } from 'class-validator';

export class PartnerUpdateRequest {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
