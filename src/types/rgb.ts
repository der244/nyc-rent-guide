export interface RGBOrder {
  order: number;
  effective_from: string;
  effective_to: string;
  one_year: RentIncrease;
  two_year: RentIncrease;
}

export type RentIncrease = 
  | { type: "flat"; pct: number }
  | { type: "split"; year1_pct: number; year2_pct_on_year1_rent: number }
  | { type: "split_by_month"; first_months: number; first_pct: number; remaining_months_pct: number };

export interface CalculationInputs {
  leaseStartDate: Date;
  currentRent: number;
  preferentialRent?: number;
  address?: string;
  unit?: string;
  unitPaysHeat?: boolean;
}

export interface CalculationResult {
  order: number;
  newLegalRent: number;
  increases: Array<{
    period: string;
    oldRent: number;
    newRent: number;
    percentIncrease: number;
    dollarIncrease: number;
  }>;
  monthlyBreakdown?: Array<{
    month: number;
    period: string;
    legalRent: number;
    tenantPay: number;
  }>;
  preferentialResult?: {
    newTenantPay: number;
    explanation: string;
  };
  appliedRule: string;
}