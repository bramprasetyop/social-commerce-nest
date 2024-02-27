import { CLAIMS_REPOSITORY } from '../core/constants';
import { Claim } from './entity/claim.entity';

export const claimProviders = [
  {
    provide: CLAIMS_REPOSITORY,
    useValue: Claim
  }
];
