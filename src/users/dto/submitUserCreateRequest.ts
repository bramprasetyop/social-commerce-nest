import { UserHeir } from '@src/userHeirs/entity/userHeir.entity';
import { UserProduct } from '@src/userProducts/entity/userProduct.entity';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmptyObject,
  IsObject,
  ValidateNested
} from 'class-validator';

import { User } from '../entity/user.entity';

export class SubmitUserCreateRequest {
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => User)
  user: User;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UserProduct)
  products: UserProduct[];

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UserHeir)
  userHeir: UserHeir[];
}
