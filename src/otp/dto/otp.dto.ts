export class OtpResponse {
  readonly id: string;
  readonly userId: string;
  readonly partnerId: string;
  readonly otp: string;
  readonly otpType: string;
  readonly expired: Date;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly updatedAt: Date;
  readonly deletedAt: Date;
  readonly deletedBy: string;
}
