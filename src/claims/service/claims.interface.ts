import { Meta } from '@src/core/dto/global.dto';

import { Claim } from '../entity/claim.entity';

export class PagingClaim {
  data: Claim[];
  meta: Meta;
}
