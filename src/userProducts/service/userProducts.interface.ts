import { Meta } from '@src/core/dto/global.dto';

import { UserProduct } from '../entity/userProduct.entity';

export class PagingUserProduct {
  data: UserProduct[];
  meta: Meta;
}
