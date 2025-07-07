import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DocumentResponseDto {
  @Expose()
  id: number;

  @Expose()
  comprobacionId: number;

  @Expose()
  fileName: string;

  @Expose()
  fileType: string;

  @Expose()
  fileSize: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
