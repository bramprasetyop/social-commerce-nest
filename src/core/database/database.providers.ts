import { Claim } from '@src/claims/entity/claim.entity';
import { GenerateLink } from '@src/generateLink/entity/generateLink.entity';
import { OTP } from '@src/otp/entity/otp.entity';
import { PartnerUser } from '@src/partnerUsers/entity/partnerUser.entity';
import { Partner } from '@src/partners/entity/partner.entity';
import { UserProduct } from '@src/userProducts/entity/userProduct.entity';
import { User } from '@src/users/entity/user.entity';
import { Sequelize } from 'sequelize-typescript';

import { SEQUELIZE } from '../constants';
import { databaseConfig } from './database.config';

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async () => {
      const config = databaseConfig.database;
      const sequelize = new Sequelize(config);
      if (process.env.NODE_ENV === 'production') {
        // Disable SQL query logging in production
        sequelize.options.logging = false;

        // Connection pooling settings
        sequelize.options.pool = {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        };
      }
      sequelize.addModels([
        Claim,
        User,
        Partner,
        PartnerUser,
        GenerateLink,
        OTP,
        UserProduct
      ]);
      // uncomment for auto syncronize
      // await sequelize.sync();
      return sequelize;
    }
  }
];
