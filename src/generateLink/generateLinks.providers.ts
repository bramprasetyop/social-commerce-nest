import { GENERATE_LINK_REPOSITORY } from '../core/constants';
import { GenerateLink } from './entity/generateLink.entity';

export const generateLinkProviders = [
  {
    provide: GENERATE_LINK_REPOSITORY,
    useValue: GenerateLink
  }
];
