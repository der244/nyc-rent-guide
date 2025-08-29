import { RGBOrder, CalculationInputs, CalculationResult, RentIncrease } from '../types/rgb';
import rgbOrdersData from '../data/rgb-orders.json';

const rgbOrders: RGBOrder[] = rgbOrdersData as RGBOrder[];

export function getGuideline(date: Date, term: 1 | 2): { order: RGBOrder; rule: RentIncrease } | null {
  for (const order of rgbOrders) {
    const effectiveFrom = new Date(order.effective_from);
    const effectiveTo = new Date(order.effective_to);
    
    if (date >= effectiveFrom && date <= effectiveTo) {
      return {
        order,
        rule: term === 1 ? order.one_year : order.two_year
      };
    }
  }
  
  return null;
}

export function calculateRentIncrease(inputs: CalculationInputs): CalculationResult | null {
  const guideline = getGuideline(inputs.leaseStartDate, inputs.leaseTerm);
  
  if (!guideline) {
    return null;
  }

  const { order, rule } = guideline;
  const baseRent = inputs.currentRent;

  switch (rule.type) {
    case 'flat':
      return calculateFlat(order, rule, baseRent, inputs);
    case 'split':
      return calculateSplit(order, rule, baseRent, inputs);
    case 'split_by_month':
      return calculateSplitByMonth(order, rule, baseRent, inputs);
    default:
      return null;
  }
}

function calculateFlat(
  order: RGBOrder, 
  rule: { type: 'flat'; pct: number }, 
  baseRent: number, 
  inputs: CalculationInputs
): CalculationResult {
  const newRent = baseRent * (1 + rule.pct / 100);
  const dollarIncrease = newRent - baseRent;

  return {
    order: order.order,
    newLegalRent: newRent,
    increases: [{
      period: inputs.leaseTerm === 1 ? 'Year 1' : 'Years 1-2',
      oldRent: baseRent,
      newRent: newRent,
      percentIncrease: rule.pct,
      dollarIncrease: dollarIncrease
    }],
    preferentialResult: inputs.preferentialRent ? {
      newTenantPay: inputs.preferentialRent,
      explanation: 'Preferential rent remains unchanged'
    } : undefined,
    appliedRule: `Order #${order.order}, ${rule.pct}% increase`
  };
}

function calculateSplit(
  order: RGBOrder,
  rule: { type: 'split'; year1_pct: number; year2_pct_on_year1_rent: number },
  baseRent: number,
  inputs: CalculationInputs
): CalculationResult {
  const year1Rent = baseRent * (1 + rule.year1_pct / 100);
  const year2Rent = year1Rent * (1 + rule.year2_pct_on_year1_rent / 100);

  const monthlyBreakdown = [];
  
  // Months 1-12: Year 1 rent
  for (let month = 1; month <= 12; month++) {
    monthlyBreakdown.push({
      month,
      period: 'Year 1',
      legalRent: year1Rent,
      tenantPay: inputs.preferentialRent || year1Rent
    });
  }
  
  // Months 13-24: Year 2 rent
  for (let month = 13; month <= 24; month++) {
    monthlyBreakdown.push({
      month,
      period: 'Year 2',
      legalRent: year2Rent,
      tenantPay: inputs.preferentialRent || year2Rent
    });
  }

  return {
    order: order.order,
    newLegalRent: year2Rent,
    increases: [
      {
        period: 'Year 1',
        oldRent: baseRent,
        newRent: year1Rent,
        percentIncrease: rule.year1_pct,
        dollarIncrease: year1Rent - baseRent
      },
      {
        period: 'Year 2',
        oldRent: year1Rent,
        newRent: year2Rent,
        percentIncrease: rule.year2_pct_on_year1_rent,
        dollarIncrease: year2Rent - year1Rent
      }
    ],
    monthlyBreakdown,
    preferentialResult: inputs.preferentialRent ? {
      newTenantPay: inputs.preferentialRent,
      explanation: 'Preferential rent remains unchanged throughout lease term'
    } : undefined,
    appliedRule: `Order #${order.order}, Year 1: ${rule.year1_pct}%, Year 2: ${rule.year2_pct_on_year1_rent}% on Year 1 rent`
  };
}

function calculateSplitByMonth(
  order: RGBOrder,
  rule: { type: 'split_by_month'; first_months: number; first_pct: number; remaining_months_pct: number },
  baseRent: number,
  inputs: CalculationInputs
): CalculationResult {
  const firstMonthsRent = baseRent * (1 + rule.first_pct / 100);
  const remainingMonthsRent = baseRent * (1 + rule.remaining_months_pct / 100);

  const monthlyBreakdown = [];
  
  // First months (e.g., 1-6)
  for (let month = 1; month <= rule.first_months; month++) {
    monthlyBreakdown.push({
      month,
      period: `Months 1-${rule.first_months}`,
      legalRent: firstMonthsRent,
      tenantPay: inputs.preferentialRent || firstMonthsRent
    });
  }
  
  // Remaining months (e.g., 7-12)
  for (let month = rule.first_months + 1; month <= 12; month++) {
    monthlyBreakdown.push({
      month,
      period: `Months ${rule.first_months + 1}-12`,
      legalRent: remainingMonthsRent,
      tenantPay: inputs.preferentialRent || remainingMonthsRent
    });
  }

  return {
    order: order.order,
    newLegalRent: remainingMonthsRent,
    increases: [
      {
        period: `Months 1-${rule.first_months}`,
        oldRent: baseRent,
        newRent: firstMonthsRent,
        percentIncrease: rule.first_pct,
        dollarIncrease: firstMonthsRent - baseRent
      },
      {
        period: `Months ${rule.first_months + 1}-12`,
        oldRent: baseRent,
        newRent: remainingMonthsRent,
        percentIncrease: rule.remaining_months_pct,
        dollarIncrease: remainingMonthsRent - baseRent
      }
    ],
    monthlyBreakdown,
    preferentialResult: inputs.preferentialRent ? {
      newTenantPay: inputs.preferentialRent,
      explanation: 'Preferential rent remains unchanged throughout lease term'
    } : undefined,
    appliedRule: `Order #${order.order}, First ${rule.first_months} months: ${rule.first_pct}%, Remaining months: ${rule.remaining_months_pct}%`
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatPercent(percent: number): string {
  return `${percent.toFixed(2)}%`;
}