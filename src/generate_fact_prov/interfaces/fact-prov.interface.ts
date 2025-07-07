export interface FactProvResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface ServiceLayerInvoiceData {
  CardCode: string;
  DocDate: string;
  DocDueDate: string;
  TaxDate: string;
  DocTotal: number;
  DocTotalFC: number;
  Comments: string;
  JournalMemo: string;
  DocumentLines: ServiceLayerInvoiceLine[];
  DocType?: string;
}

export interface ServiceLayerInvoiceLine {
  ItemCode?: string;
  Quantity: number;
  UnitPrice: number;
  LineTotal: number;
  TaxCode: string;
  AccountCode: string;
  LineMemo: string;
}

export interface CardMatchResult {
  success: boolean;
  message: string;
  data?: {
    CardCode: string;
    CardName: string;
    CardForeignName: string;
  };
  error?: string;
}

export interface InvoiceGenerationResult {
  success: boolean;
  message: string;
  invoiceId?: number;
  error?: string;
}
