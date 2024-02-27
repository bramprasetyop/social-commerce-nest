import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'partners',
  timestamps: true,
  paranoid: true
})
export class Partner extends Model<Partner> {
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
    field: 'name'
  })
  name: string;

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
