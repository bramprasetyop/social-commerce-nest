import { OTP_REPOSITORY } from '../core/constants';
import { OTP } from './entity/otp.entity';

export const OTPProviders = [
  {
    provide: OTP_REPOSITORY,
    useValue: OTP
  }
];
