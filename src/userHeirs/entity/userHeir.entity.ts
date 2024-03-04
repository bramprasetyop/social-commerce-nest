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
  tableName: 'user_heirs',
  timestamps: true,
  paranoid: true
})
export class UserHeir extends Model<UserHeir> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    field: 'id'
  })
  id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id'
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'relation'
  })
  relation: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'name'
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'nik',
    unique: true
  })
  nik: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'dob'
  })
  dob: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'phone_no'
  })
  phoneNo: string;

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
