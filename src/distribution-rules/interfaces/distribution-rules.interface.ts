export interface DistributionRule {
  FactorDescription: string;
}

export interface DistributionRulesResponse {
  'odata.metadata': string;
  value: DistributionRule[];
}
