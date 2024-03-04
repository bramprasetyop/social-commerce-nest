import { User } from '@src/users/entity/user.entity';

import { GENERATE_LINK_REPOSITORY, USERS_REPOSITORY } from '../core/constants';
import { GenerateLink } from './entity/generateLink.entity';

export const generateLinkProviders = [
  {
    provide: GENERATE_LINK_REPOSITORY,
    useValue: GenerateLink
  },
  {
    provide: USERS_REPOSITORY,
    useValue: User
  }
];
