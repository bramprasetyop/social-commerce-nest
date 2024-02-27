import { PartnerUserResponse } from './partnerUser.dto';

export class PartnerUserFindAllResponse {
  data: PartnerUserResponse[];
  meta: {
    pageSize: number;
    currentPage: number;
    total: number;
    totalPage: number;
  };
}
