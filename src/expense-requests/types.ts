import { User } from '@prisma/client';

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

// Definimos una interfaz para los tipos de relaciones
interface UserWithRelations extends User {
  company: { id: number; name: string } | null;
  branch: { id: number; name: string; companyId: number } | null;
  area: { id: number; name: string; branchId: number } | null;
  role: { id: number; name: string };
}

export interface ExpenseRequestWithRelations {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  createdAt: Date;
  travelReason: string;
  departureDate: Date;
  returnDate: Date;
  disbursementDate: Date;
  travelObjectives: string;
  approverId: number | null;
  comment: string | null;
  user: UserWithRelations;
  details: {
    id: number;
    expenseRequestId: number;
    concept: string;
    amount: number;
  }[];
}
