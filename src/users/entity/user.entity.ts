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
    field: 'email',
    unique: true
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'nik'
  })
  nik: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'telp_no'
  })
  telpNo: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'status'
  })
  status: boolean;

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
