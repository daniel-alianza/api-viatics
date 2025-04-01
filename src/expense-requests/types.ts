import { ExpenseRequest, User } from '@prisma/client';

export interface CreateExpenseRequestDto {
  userId: number;
  totalAmount: number;
  travelReason: string;
  departureDate: string;
  returnDate: string;
  disbursementDate: string;
  travelObjectives: string;
  details: {
    concept: string;
    amount: number;
  }[];
}

export interface ExpenseRequestWithRelations extends ExpenseRequest {
  user: User & {
    company: { name: string } | null;
    branch: { name: string } | null;
    area: { name: string } | null;
    role: { name: string };
  };
  approver?: User | null;
  details: Array<{
    concept: string;
    amount: number;
  }>;
}
