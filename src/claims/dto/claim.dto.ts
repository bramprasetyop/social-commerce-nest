export class ClaimResponse {
  readonly id: number;
  readonly noKlaim: string;
  readonly noTertanggung: string;
  readonly tanggalPeriksa: Date;
  readonly namaTertanggung: string;
  readonly namaKaryawan: string;
  readonly plan: string;
  readonly totalKlaim: number;
  readonly statusSubmit: string;
  readonly cutoffDate: Date;
  readonly isResubmit: boolean;
  readonly submitCounter: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date;
  readonly noNota: string;
}
