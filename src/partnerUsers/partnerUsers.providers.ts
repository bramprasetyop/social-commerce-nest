import { PARTNER_USERS_REPOSITORY } from '../core/constants';
import { PartnerUser } from './entity/partnerUser.entity';

export const generateLinkProviders = [
  {
    provide: PARTNER_USERS_REPOSITORY,
    useValue: PartnerUser
  }
];
