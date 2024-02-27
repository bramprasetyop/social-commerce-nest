import { Meta } from '@src/core/dto/global.dto';

import { PartnerUser } from '../entity/partnerUser.entity';

export class PagingPartnerUser {
  data: PartnerUser[];
  meta: Meta;
}
