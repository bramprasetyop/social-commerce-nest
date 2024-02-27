import { Meta } from '@src/core/dto/global.dto';

import { Partner } from '../entity/partner.entity';

export class PagingPartner {
  data: Partner[];
  meta: Meta;
}
