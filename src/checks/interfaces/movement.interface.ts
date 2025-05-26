export interface Movement {
  Sequence: string;
  DueDate: Date;
  Memo: string;
  DebAmount: number;
  AcctName: string;
  Ref: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}
