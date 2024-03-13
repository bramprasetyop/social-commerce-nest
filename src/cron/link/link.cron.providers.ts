import { GENERATE_LINK_REPOSITORY } from '@src/core/constants';
import { GenerateLink } from '@src/generateLink/entity/generateLink.entity';

export const linkProviders = [
  {
    provide: GENERATE_LINK_REPOSITORY,
    useValue: GenerateLink
  }
];
