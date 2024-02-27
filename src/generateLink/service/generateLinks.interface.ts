import { Meta } from '@src/core/dto/global.dto';

import { GenerateLink } from '../entity/generateLink.entity';

export class PagingGenerateLink {
  data: GenerateLink[];
  meta: Meta;
}
