export interface TaxCodeResponse {
  'odata.metadata': string;
  value: Array<{
    ValidForAR: string;
    ValidForAP: string;
    UserSignature: number;
    Rate: number;
    Name: string;
    Freight: string;
    Code: string;
    IsItemLevel: string;
    Inactive: string;
    FADebit: string;
    U_B1SYS_FactorType: string;
    SalesTaxCodes_Lines: Array<any>;
  }>;
}

export interface SimplifiedTaxCode {
  Name: string;
  Code: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
