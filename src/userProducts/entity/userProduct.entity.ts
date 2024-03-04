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
  tableName: 'user_products',
  timestamps: true,
  paranoid: true
})
export class UserProduct extends Model<UserProduct> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    field: 'id'
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'product_id'
  })
  productId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id'
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Partner)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'partner_id'
  })
  partnerId: string;

  @BelongsTo(() => Partner)
  partner: Partner;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'sum_assured'
  })
  sumAssured: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_e_policy'
  })
  isEPolicy: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: false,
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
