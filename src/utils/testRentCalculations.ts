import { calculateRentIncrease, getGuideline } from './rentCalculator';
import { CalculationInputs } from '../types/rgb';

// Test scenarios for each RGB order
export const testScenarios = [
  {
    order: 55,
    testDate: new Date('2024-08-01'),
    description: 'Order 55 - Aug 1, 2024',
    expected: {
      oneYear: 3.0,
      twoYearFirstYear: 2.75,
      twoYearSecondYear: 3.25
    }
  },
  {
    order: 54,
    testDate: new Date('2023-01-01'), 
    description: 'Order 54 - Jan 1, 2023',
    expected: {
      oneYear: 3.25,
      twoYear: 5.0
    }
  },
  {
    order: 53,
    testDate: new Date('2022-01-01'),
    description: 'Order 53 - Jan 1, 2022 (split by month)',
    expected: {
      oneYearFirstMonths: 0.0,
      oneYearRemainingMonths: 1.5,
      twoYear: 2.5
    }
  },
  {
    order: 52,
    testDate: new Date('2021-01-01'),
    description: 'Order 52 - Jan 1, 2021 (freeze year)',
    expected: {
      oneYear: 0.0,
      twoYearFirstYear: 0.0,
      twoYearSecondYear: 1.0
    }
  }
];

export function runRentCalculationTests(): void {
  console.log('🧪 Running RGB Order Calculation Tests\n');
  
  const testInputs: CalculationInputs = {
    leaseStartDate: new Date(),
    currentRent: 2000,
    preferentialRent: 1800
  };

  testScenarios.forEach(scenario => {
    console.log(`\n📋 Testing ${scenario.description}`);
    console.log('─'.repeat(50));
    
    testInputs.leaseStartDate = scenario.testDate;
    
    // Test 1-year lease
    const oneYearResult = calculateRentIncrease(testInputs, 1);
    console.log(`1-Year Lease:`);
    if (oneYearResult) {
      console.log(`  Order: ${oneYearResult.order}`);
      console.log(`  Increases: ${JSON.stringify(oneYearResult.increases, null, 2)}`);
      console.log(`  Applied Rule: ${oneYearResult.appliedRule}`);
      
      // Verify guideline selection
      const guideline = getGuideline(scenario.testDate, 1);
      console.log(`  Guideline Selected: Order ${guideline?.order.order}, Rule: ${JSON.stringify(guideline?.rule)}`);
    } else {
      console.log(`  ❌ No result returned`);
    }
    
    // Test 2-year lease
    const twoYearResult = calculateRentIncrease(testInputs, 2);
    console.log(`\n2-Year Lease:`);
    if (twoYearResult) {
      console.log(`  Order: ${twoYearResult.order}`);
      console.log(`  Increases: ${JSON.stringify(twoYearResult.increases, null, 2)}`);
      console.log(`  Applied Rule: ${twoYearResult.appliedRule}`);
      
      // Verify guideline selection
      const guideline = getGuideline(scenario.testDate, 2);
      console.log(`  Guideline Selected: Order ${guideline?.order.order}, Rule: ${JSON.stringify(guideline?.rule)}`);
    } else {
      console.log(`  ❌ No result returned`);
    }
  });
  
  console.log('\n✅ Test completed. Check results above for accuracy.');
}

// Specific test for Order 55 issue with user's exact values
export function testOrder55WithUserValues(): void {
  console.log('🔍 Testing Order 55 with User\'s Exact Values\n');
  
  const testInputs: CalculationInputs = {
    leaseStartDate: new Date('2024-08-01'),
    currentRent: 1759.79,
    preferentialRent: 1711.75
  };
  
  console.log('Input Values:');
  console.log(`Legal Rent: $${testInputs.currentRent}`);
  console.log(`Preferential Rent: $${testInputs.preferentialRent}`);
  console.log(`Lease Start Date: ${testInputs.leaseStartDate.toDateString()}\n`);
  
  // Test 2-year lease (the problem scenario)
  console.log('2-Year Lease Test:');
  const twoYearResult = calculateRentIncrease(testInputs, 2);
  const twoYearGuideline = getGuideline(testInputs.leaseStartDate, 2);
  
  console.log(`Guideline Selected: Order ${twoYearGuideline?.order.order}, Rule: ${JSON.stringify(twoYearGuideline?.rule)}`);
  
  if (twoYearResult) {
    console.log('\nCalculated Results:');
    twoYearResult.increases.forEach((increase, index) => {
      console.log(`${increase.period}: ${increase.percentIncrease}% - $${increase.oldRent} → $${increase.newRent.toFixed(2)}`);
    });
    
    console.log(`\nPreferential Rent Results:`);
    if (twoYearResult.monthlyBreakdown) {
      const year1Pref = twoYearResult.monthlyBreakdown[0].tenantPay;
      const year2Pref = twoYearResult.monthlyBreakdown[12].tenantPay;
      console.log(`Year 1 Preferential: $${year1Pref.toFixed(2)} (Expected: $1758.82)`);
      console.log(`Year 2 Preferential: $${year2Pref.toFixed(2)} (Expected: $1815.10)`);
      
      const year1Match = Math.abs(year1Pref - 1758.82) < 0.01;
      const year2Match = Math.abs(year2Pref - 1815.10) < 0.01;
      console.log(`✅ Year 1 Match: ${year1Match ? 'PASSED' : 'FAILED'}`);
      console.log(`✅ Year 2 Match: ${year2Match ? 'PASSED' : 'FAILED'}`);
    }
  } else {
    console.log('❌ No calculation result returned');
  }
}

// Specific test for Order 55 issue
export function testOrder55Specifically(): void {
  console.log('🔍 Detailed Order 55 Test (Aug 1, 2024)\n');
  
  const testInputs: CalculationInputs = {
    leaseStartDate: new Date('2024-08-01'),
    currentRent: 2000,
    preferentialRent: 1800
  };
  
  // Test 1-year lease (should be 3.0%)
  console.log('1-Year Lease Test:');
  const oneYearResult = calculateRentIncrease(testInputs, 1);
  const oneYearGuideline = getGuideline(testInputs.leaseStartDate, 1);
  
  console.log(`Guideline: ${JSON.stringify(oneYearGuideline?.rule)}`);
  console.log(`Expected: 3.0% increase`);
  console.log(`Actual: ${oneYearResult?.increases[0]?.percentIncrease}% increase`);
  console.log(`Legal Rent: $${testInputs.currentRent} → $${oneYearResult?.newLegalRent}`);
  console.log(`Preferential: $${testInputs.preferentialRent} → $${oneYearResult?.preferentialResult?.newTenantPay}`);
  
  const isOneYearCorrect = oneYearResult?.increases[0]?.percentIncrease === 3.0;
  console.log(`✅ 1-Year Test: ${isOneYearCorrect ? 'PASSED' : 'FAILED'}\n`);
  
  // Test 2-year lease (should be 2.75% then 3.2%)
  console.log('2-Year Lease Test:');
  const twoYearResult = calculateRentIncrease(testInputs, 2);
  const twoYearGuideline = getGuideline(testInputs.leaseStartDate, 2);
  
  console.log(`Guideline: ${JSON.stringify(twoYearGuideline?.rule)}`);
  console.log(`Expected: 2.75% Year 1, 3.25% Year 2`);
  console.log(`Actual Year 1: ${twoYearResult?.increases[0]?.percentIncrease}%`);
  console.log(`Actual Year 2: ${twoYearResult?.increases[1]?.percentIncrease}%`);
  
  const isTwoYearCorrect = 
    twoYearResult?.increases[0]?.percentIncrease === 2.75 &&
    twoYearResult?.increases[1]?.percentIncrease === 3.25;
  console.log(`✅ 2-Year Test: ${isTwoYearCorrect ? 'PASSED' : 'FAILED'}`);
}