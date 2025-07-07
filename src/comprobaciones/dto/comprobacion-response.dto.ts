import { Exclude, Expose, Type } from 'class-transformer';
import { DocumentResponseDto } from './document-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Exclude()
export class ComprobacionResponseDto {
  @Expose()
  id: number;

  @Expose()
  viaticoId: number;

  @Expose()
  userId: number;

  @Expose()
  expenseRequestId: number;

  @Expose()
  description: string;

  @Expose()
  status: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => DocumentResponseDto)
  documents: DocumentResponseDto[];

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  approver?: UserResponseDto;

  @Expose()
  approverComment?: string;
}
