export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}
