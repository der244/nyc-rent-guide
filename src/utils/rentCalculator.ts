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

// Helper function for precise currency calculations using integer arithmetic
function preciseCalculate(amount: number, percentage: number): number {
  // Convert to cents to avoid floating point errors
  const cents = Math.round(amount * 100);
  const increasedCents = Math.round(cents * (1 + percentage / 100));
  return increasedCents / 100;
}

export function calculateRentIncrease(inputs: CalculationInputs, leaseTerm: 1 | 2): CalculationResult | null {
  const guideline = getGuideline(inputs.leaseStartDate, leaseTerm);
  
  if (!guideline) {
    return null;
  }

  const { order, rule } = guideline;
  const baseRent = inputs.currentRent;

  switch (rule.type) {
    case 'flat':
      return calculateFlat(order, rule, baseRent, inputs, leaseTerm);
    case 'split':
      return calculateSplit(order, rule, baseRent, inputs, leaseTerm);
    case 'split_by_month':
      return calculateSplitByMonth(order, rule, baseRent, inputs, leaseTerm);
    default:
      return null;
  }
}

function calculateFlat(
  order: RGBOrder, 
  rule: { type: 'flat'; pct: number }, 
  baseRent: number, 
  inputs: CalculationInputs,
  leaseTerm: 1 | 2
): CalculationResult {
  const newRent = baseRent * (1 + rule.pct / 100);
  const dollarIncrease = newRent - baseRent;

  return {
    order: order.order,
    newLegalRent: newRent,
    increases: [{
      period: leaseTerm === 1 ? 'Year 1' : 'Years 1-2',
      oldRent: baseRent,
      newRent: newRent,
      percentIncrease: rule.pct,
      dollarIncrease: dollarIncrease
    }],
    preferentialResult: inputs.preferentialRent ? {
      newTenantPay: preciseCalculate(inputs.preferentialRent, rule.pct),
      explanation: `Preferential rent increases by ${rule.pct}%`
    } : undefined,
    appliedRule: `Order #${order.order}, ${rule.pct}% increase`
  };
}

function calculateSplit(
  order: RGBOrder,
  rule: { type: 'split'; year1_pct: number; year2_pct_on_year1_rent: number },
  baseRent: number,
  inputs: CalculationInputs,
  leaseTerm: 1 | 2
): CalculationResult {
  const year1Rent = baseRent * (1 + rule.year1_pct / 100);
  const year2Rent = year1Rent * (1 + rule.year2_pct_on_year1_rent / 100);

  // Calculate preferential rent for each year using precise arithmetic
  let year1PreferentialRent = inputs.preferentialRent;
  let year2PreferentialRent = inputs.preferentialRent;
  
  if (inputs.preferentialRent) {
    // Use precise calculation to avoid floating point errors
    year1PreferentialRent = preciseCalculate(inputs.preferentialRent, rule.year1_pct);
    year2PreferentialRent = preciseCalculate(year1PreferentialRent, rule.year2_pct_on_year1_rent);
    
    console.log('🔍 PRECISE CALC:', {
      original: inputs.preferentialRent,
      year1Pct: rule.year1_pct,
      year2Pct: rule.year2_pct_on_year1_rent,
      year1Result: year1PreferentialRent,
      year2Result: year2PreferentialRent
    });
  }

  const monthlyBreakdown = [];
  
  // Months 1-12: Year 1 rent
  for (let month = 1; month <= 12; month++) {
    monthlyBreakdown.push({
      month,
      period: 'Year 1',
      legalRent: year1Rent,
      tenantPay: year1PreferentialRent || year1Rent
    });
  }
  
  // Months 13-24: Year 2 rent
  for (let month = 13; month <= 24; month++) {
    monthlyBreakdown.push({
      month,
      period: 'Year 2',
      legalRent: year2Rent,
      tenantPay: year2PreferentialRent || year2Rent
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
    preferentialResult: inputs.preferentialRent && year2PreferentialRent ? {
      newTenantPay: year2PreferentialRent,
      year1Amount: year1PreferentialRent,
      explanation: `Preferential rent increases by ${rule.year1_pct}% in Year 1, then ${rule.year2_pct_on_year1_rent}% in Year 2`
    } : undefined,
    appliedRule: `Order #${order.order}, Year 1: ${rule.year1_pct}%, Year 2: ${rule.year2_pct_on_year1_rent}% on Year 1 rent`
  };
}

function calculateSplitByMonth(
  order: RGBOrder,
  rule: { type: 'split_by_month'; first_months: number; first_pct: number; remaining_months_pct: number },
  baseRent: number,
  inputs: CalculationInputs,
  leaseTerm: 1 | 2
): CalculationResult {
  const firstMonthsRent = baseRent * (1 + rule.first_pct / 100);
  const remainingMonthsRent = baseRent * (1 + rule.remaining_months_pct / 100);

  // Calculate preferential rent for each period if it exists
  let firstMonthsPreferentialRent = inputs.preferentialRent;
  let remainingMonthsPreferentialRent = inputs.preferentialRent;
  
  if (inputs.preferentialRent) {
    firstMonthsPreferentialRent = preciseCalculate(inputs.preferentialRent, rule.first_pct);
    remainingMonthsPreferentialRent = preciseCalculate(inputs.preferentialRent, rule.remaining_months_pct);
  }

  const monthlyBreakdown = [];
  
  // First months (e.g., 1-6)
  for (let month = 1; month <= rule.first_months; month++) {
    monthlyBreakdown.push({
      month,
      period: `Months 1-${rule.first_months}`,
      legalRent: firstMonthsRent,
      tenantPay: firstMonthsPreferentialRent || firstMonthsRent
    });
  }
  
  // Remaining months (e.g., 7-12)
  for (let month = rule.first_months + 1; month <= 12; month++) {
    monthlyBreakdown.push({
      month,
      period: `Months ${rule.first_months + 1}-12`,
      legalRent: remainingMonthsRent,
      tenantPay: remainingMonthsPreferentialRent || remainingMonthsRent
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
    preferentialResult: inputs.preferentialRent && remainingMonthsPreferentialRent ? {
      newTenantPay: remainingMonthsPreferentialRent,
      explanation: `Preferential rent: ${rule.first_pct}% for months 1-${rule.first_months}, then ${rule.remaining_months_pct}% for remaining months`
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