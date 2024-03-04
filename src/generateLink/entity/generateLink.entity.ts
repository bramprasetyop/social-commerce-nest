import { PartnerUser } from '@src/partnerUsers/entity/partnerUser.entity';
import { Partner } from '@src/partners/entity/partner.entity';
import { User } from '@src/users/entity/user.entity';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript';

@Table({
  tableName: 'short_links',
  timestamps: true,
  paranoid: true
})
export class GenerateLink extends Model<GenerateLink> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    field: 'id'
  })
  id: string;

  @ForeignKey(() => Partner)
  @Column({
    type: DataType.UUID,
    field: 'partner_id'
  })
  partnerId: string;

  @BelongsTo(() => Partner)
  partner: Partner;

  @ForeignKey(() => PartnerUser)
  @Column({
    type: DataType.UUID,
    field: 'partner_user_id'
  })
  partnerUserId: string;

  @BelongsTo(() => PartnerUser)
  partnerUser: PartnerUser;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    field: 'user_id'
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'link'
  })
  link: string;

  @Column({
    type: DataType.DATE,
    field: 'expired'
  })
  expired: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  })
  isActive: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'created_at'
  })
  createdAt: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'created_by'
  })
  createdBy: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'updated_at'
  })
  updatedAt: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'updated_by'
  })
  updatedBy: string;

  @Column({
    type: DataType.DATE,
    field: 'deleted_at'
  })
  deletedAt: Date;

  @Column({
    type: DataType.STRING,
    field: 'deleted_by'
  })
  deletedBy: string;
}
