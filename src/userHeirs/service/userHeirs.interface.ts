import { Meta } from '@src/core/dto/global.dto';

import { UserHeir } from '../entity/userHeir.entity';

export class PagingUserHeir {
  data: UserHeir[];
  meta: Meta;
}
