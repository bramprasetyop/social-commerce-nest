import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'claims',
  timestamps: true,
  paranoid: true
})
export class Claim extends Model<Claim> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  })
  id: number;

  @Column({
    type: DataType.STRING(255),
    field: 'no_klaim'
  })
  noKlaim: string;

  @Column({
    type: DataType.STRING(255),
    field: 'no_tertanggung'
  })
  noTertanggung: string;

  @Column({
    type: DataType.DATE,
    field: 'tanggal_periksa'
  })
  tanggalPeriksa: Date;

  @Column({
    type: DataType.STRING(255),
    field: 'nama_tertanggung'
  })
  namaTertanggung: string;

  @Column({
    type: DataType.STRING(255),
    field: 'nama_karyawan'
  })
  namaKaryawan: string;

  @Column({
    type: DataType.ENUM('0', '1', '2', '3'),
    field: 'plan'
  })
  plan: string;

  @Column({
    type: DataType.INTEGER,
    field: 'total_klaim'
  })
  totalKlaim: number;

  @Column({
    type: DataType.ENUM('0', '1'),
    field: 'status_submit'
  })
  statusSubmit: string;

  @Column({
    type: DataType.DATE,
    field: 'cutoff_date'
  })
  cutoffDate: Date;

  @Column({
    type: DataType.BOOLEAN,
    field: 'is_resubmit'
  })
  isResubmit: boolean;

  @Column({
    type: DataType.INTEGER,
    field: 'submit_counter'
  })
  submitCounter: number;

  @Column({
    type: DataType.DATE,
    field: 'created_at'
  })
  createdAt: Date;

  @Column({
    type: DataType.DATE,
    field: 'updated_at'
  })
  updatedAt: Date;

  @Column({
    type: DataType.DATE,
    field: 'deleted_at'
  })
  deletedAt: Date;

  @Column({
    type: DataType.STRING(255),
    field: 'no_nota'
  })
  noNota: string;
}
