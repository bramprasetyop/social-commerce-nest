import { Meta } from '@src/core/dto/global.dto';

import { OTP } from '../entity/otp.entity';

export class PagingOtp {
  data: OTP[];
  meta: Meta;
}
