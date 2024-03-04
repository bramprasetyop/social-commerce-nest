import { UserHeirResponse } from './userHeir.dto';

export class UserHeirFindAllResponse {
  data: UserHeirResponse[];
  meta: {
    pageSize: number;
    currentPage: number;
    total: number;
    totalPage: number;
  };
}
