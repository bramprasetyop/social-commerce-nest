import { PARTNERS_REPOSITORY } from '@src/core/constants';
import { Partner } from '@src/partners/entity/partner.entity';

export const connectionCheckProviders = [
  {
    provide: PARTNERS_REPOSITORY,
    useValue: Partner
  }
];
