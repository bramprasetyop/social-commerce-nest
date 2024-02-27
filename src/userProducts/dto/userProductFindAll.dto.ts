import { UserProductResponse } from './userProduct.dto';

export class UserProductFindAllResponse {
  data: UserProductResponse[];
  meta: {
    pageSize: number;
    currentPage: number;
    total: number;
    totalPage: number;
  };
}
