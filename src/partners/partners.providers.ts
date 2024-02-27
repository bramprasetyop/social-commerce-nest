import { PARTNERS_REPOSITORY } from '../core/constants';
import { Partner } from './entity/partner.entity';

export const PartnerProviders = [
  {
    provide: PARTNERS_REPOSITORY,
    useValue: Partner
  }
];
