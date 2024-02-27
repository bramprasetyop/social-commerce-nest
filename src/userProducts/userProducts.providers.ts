import { USER_PRODUCTS_REPOSITORY } from '../core/constants';
import { UserProduct } from './entity/userProduct.entity';

export const userProductProviders = [
  {
    provide: USER_PRODUCTS_REPOSITORY,
    useValue: UserProduct
  }
];
