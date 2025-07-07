export interface CustomError extends Error {
  code?: string;
  response?: {
    data?: any;
    status?: number;
  };
}
