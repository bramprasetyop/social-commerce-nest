import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyLinkRequest {
  @IsString()
  @IsNotEmpty()
  link: string;
}
