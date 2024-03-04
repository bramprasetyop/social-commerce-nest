import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true
})
export class User extends Model<User> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    field: 'id'
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'name'
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'dob'
  })
  dob: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'address'
  })
  address: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'email'
  })
  email: string;

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
    field: 'phone_no'
  })
  phoneNo: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'occupation'
  })
  occupation: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'city'
  })
  city: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'zip_code'
  })
  zipCode: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'marital_status'
  })
  maritalStatus: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'gender'
  })
  gender: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'id_card_photo'
  })
  idCardPhoto: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'selfie_photo'
  })
  selfiePhoto: string;

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
