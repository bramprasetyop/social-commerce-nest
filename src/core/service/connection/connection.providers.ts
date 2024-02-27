import { Claim } from '@src/claims/entity/claim.entity';
import { CLAIMS_REPOSITORY } from '@src/core/constants';

export const connectionCheckProviders = [
  {
    provide: CLAIMS_REPOSITORY,
    useValue: Claim
  }
];
