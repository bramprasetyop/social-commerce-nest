import { GenerateLinkResponse } from './generateLink.dto';

export class GenerateLinkFindAllResponse {
  data: GenerateLinkResponse[];
  meta: {
    pageSize: number;
    currentPage: number;
    total: number;
    totalPage: number;
  };
}
