export interface ServiceResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: number;
    message: string;
    details?: string;
    line?: number;
  };
}
