import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ name: 'username', example: 'xxxxxxxx', required: true })
  @IsString({ message: 'Username tidak boleh kosong.' })
  username: string;

  @ApiProperty({ name: 'password', example: 'xxxxxxxx', required: true })
  @IsString({ message: 'Password tidak boleh kosong.' })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Berhasil Login' })
  statusDescription: string;

  @ApiProperty()
  data: object;
}
