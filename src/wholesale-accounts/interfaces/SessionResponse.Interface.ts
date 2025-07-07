export interface SessionResponse {
  success: boolean;
  message: string;
  data: {
    empresa: string;
    baseDatos: string;
    sessionId: string;
  };
}
