import { ApiHideProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class OpenAPIHeaderRequest {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @ApiHideProperty()
  @Expose({ name: 'x-timestamp' })
  'X-TIMESTAMP': string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @ApiHideProperty()
  @Expose({ name: 'x-client-id' })
  'X-CLIENT-ID': string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @ApiHideProperty()
  @Expose({ name: 'x-signature' })
  'X-SIGNATURE': string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @ApiHideProperty()
  @Expose({ name: 'authorization' })
  Authorization: string;
}
