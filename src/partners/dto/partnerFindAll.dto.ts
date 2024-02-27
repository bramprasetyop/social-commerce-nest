import { PartnerResponse } from './partner.dto';

export class PartnerFindAllResponse {
  data: PartnerResponse[];
  meta: {
    pageSize: number;
    currentPage: number;
    total: number;
    totalPage: number;
  };
}
