import { User } from '@src/users/entity/user.entity';

import { USERS_REPOSITORY, USER_HEIRS_REPOSITORY } from '../core/constants';
import { UserHeir } from './entity/userHeir.entity';

export const userProviders = [
  {
    provide: USER_HEIRS_REPOSITORY,
    useValue: UserHeir
  },
  {
    provide: USERS_REPOSITORY,
    useValue: User
  }
];
