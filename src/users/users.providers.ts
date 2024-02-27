import { USERS_REPOSITORY } from '../core/constants';
import { User } from './entity/user.entity';

export const userProviders = [
  {
    provide: USERS_REPOSITORY,
    useValue: User
  }
];
