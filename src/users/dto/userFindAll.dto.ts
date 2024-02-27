import { UserResponse } from './user.dto';

export class UserFindAllResponse {
  data: UserResponse[];
  meta: {
    pageSize: number;
    currentPage: number;
    total: number;
    totalPage: number;
  };
}
