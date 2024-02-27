import { OtpResponse } from './otp.dto';

export class OtpFindAllResponse {
  data: OtpResponse[];
  meta: {
    pageSize: number;
    currentPage: number;
    total: number;
    totalPage: number;
  };
}
