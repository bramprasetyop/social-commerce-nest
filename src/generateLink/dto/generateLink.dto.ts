export class GenerateLinkResponse {
  readonly id: string;
  readonly partnerId: string;
  readonly partnerUserId: string;
  readonly userId: string;
  readonly status: boolean;
  readonly link: string;
  readonly expired: Date;
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly updatedAt: Date;
  readonly deletedAt: Date;
  readonly deletedBy: string;
}
