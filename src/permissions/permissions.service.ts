import { Injectable } from '@nestjs/common';
import claimPermission from '@src/claims/claims.enum';
import { LoggerService } from '@src/core/service/logger/logger.service';
import generateLinkPermission from '@src/generateLink/generateLinks.enum';
import otpPermission from '@src/otp/otp.enum';
import partnerUserPermission from '@src/partnerUsers/partnerUsers.enum';
import partnerPermission from '@src/partners/partners.enum';
import userproductPermission from '@src/userProducts/userProducts.enum';
import userPermission from '@src/users/users.enum';

@Injectable()
export class PermissionsService {
  constructor(private readonly logger: LoggerService) {}

  private addPermissionToModule(
    permissionsByModule: any,
    module: string,
    permission: string
  ) {
    if (!permissionsByModule[module]) {
      permissionsByModule[module] = [];
    }
    permissionsByModule[module].push(permission);
  }

  private processEnums(enumArray: any[]): any {
    const permissionsByModule: any = {};

    enumArray.forEach(enumeration => {
      for (const key in enumeration) {
        if (Object.prototype.hasOwnProperty.call(enumeration, key)) {
          const permission = enumeration[key];
          if (typeof permission === 'string') {
            const [module] = permission.split('_');
            this.addPermissionToModule(permissionsByModule, module, permission);
          } else {
            this.logger.log('Invalid permission found:', permission);
          }
        }
      }
    });

    return permissionsByModule;
  }

  async findAll(): Promise<any> {
    try {
      this.logger.log('Starting to get all permissions', 'PermissionsService');

      const allEnums = [
        claimPermission,
        generateLinkPermission,
        otpPermission,
        partnerUserPermission,
        partnerPermission,
        userproductPermission,
        userPermission
      ];
      const permissionsByModule = this.processEnums(allEnums);

      this.logger.log(
        'Successfully retrieved all permissions',
        permissionsByModule
      );

      return permissionsByModule;
    } catch (error) {
      this.logger.error(
        'Error while fetching permissions',
        'PermissionsService',
        error
      );
      throw new Error('Failed to fetch permissions');
    }
  }

  hasPermission(menu: any, action: string): boolean {
    // remove this if on ait/production
    return true;
    return menu.includes(action) && true;
  }
}
