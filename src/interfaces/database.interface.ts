export interface ComprobacionViat {
  // Aquí deberías definir la interfaz con los campos de tu tabla ComprobacionesViat
  [key: string]: any;
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
