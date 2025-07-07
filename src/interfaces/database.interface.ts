export interface ComprobacionViat {
  // Aquí deberías definir la interfaz con los campos de tu tabla ComprobacionesViat
  [key: string]: any;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseRequest {
  id: number;
  totalAmount: number;
  status: string;
  travelReason: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: number;
  type: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
  comprobacionId: number;
  description: string | null;
}

export interface Comprobacion {
  id: number;
  viaticoId: string;
  sequence: string;
  dueDate: Date;
  memo: string;
  debitAmount: number;
  acctName: string;
  ref: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  expenseRequestId: number | null;
  comprobanteType: string;
  responsable: string | null;
  motivo: string | null;
  descripcion: string | null;
  importe: number | null;
  approverId: number | null;
  approverComment: string | null;
  user: User;
  expenseRequest: ExpenseRequest | null;
  documents: Document[];
}

export interface MovementResult {
  TotalExtractos: number;
  TotalComprobacionesFaltantes: number;
  TotalComprobacionesRealizadas: number;
  DiasRestantesParaComprobar: number;
}

export interface Viatico {
  // Aquí deberías definir la interfaz con los campos de tu tabla VIAT
  [key: string]: any;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
