import { ClaimResponse } from './claim.dto';

export class ClaimFindAllResponse {
  data: ClaimResponse[];
  meta: {
    pageSize: number;
    currentPage: number;
    total: number;
    totalPage: number;
  };
}
