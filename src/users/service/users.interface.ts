import { Meta } from '@src/core/dto/global.dto';

import { User } from '../entity/user.entity';

export class PagingUser {
  data: User[];
  meta: Meta;
}
