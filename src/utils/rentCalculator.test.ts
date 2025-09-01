import { describe, it, expect } from 'vitest';
import { calculateRentIncrease, getGuideline, formatCurrency, formatPercent } from './rentCalculator';
import { CalculationInputs } from '../types/rgb';

describe('rentCalculator', () => {
  describe('getGuideline', () => {
    it('should return correct guideline for Order 55 (Aug 1, 2024)', () => {
      const guideline = getGuideline(new Date('2024-08-01'), 1);
      expect(guideline).toBeTruthy();
      expect(guideline?.order.order).toBe(55);
      expect(guideline?.rule).toEqual({ type: 'flat', pct: 3.0 });
    });

    it('should return correct guideline for Order 55 two-year lease', () => {
      const guideline = getGuideline(new Date('2024-08-01'), 2);
      expect(guideline).toBeTruthy();
      expect(guideline?.order.order).toBe(55);
      expect(guideline?.rule).toEqual({
        type: 'split',
        year1_pct: 2.75,
        year2_pct_on_year1_rent: 3.25
      });
    });

    it('should return null for invalid date', () => {
      const guideline = getGuideline(new Date('2030-01-01'), 1);
      expect(guideline).toBeNull();
    });
  });

  describe('calculateRentIncrease - Order 55 Bug Fix Test Case', () => {
    const testInputs: CalculationInputs = {
      leaseStartDate: new Date('2024-08-01'),
      currentRent: 1759.79,
      preferentialRent: 1711.75
    };

    it('should calculate correct 1-year lease for Order 55', () => {
      const result = calculateRentIncrease(testInputs, 1);
      
      expect(result).toBeTruthy();
      expect(result?.order).toBe(55);
      expect(result?.increases).toHaveLength(1);
      
      const increase = result?.increases[0];
      expect(increase?.percentIncrease).toBe(3.0);
      expect(increase?.oldRent).toBe(1759.79);
      expect(increase?.newRent).toBe(1812.58); // 1759.79 + (1759.79 * 0.03 rounded)
      expect(increase?.dollarIncrease).toBe(52.79);
      
      // Test preferential rent calculation
      expect(result?.preferentialResult?.newTenantPay).toBe(1763.10); // 1711.75 + (1711.75 * 0.03 rounded)
    });

    it('should calculate correct 2-year lease for Order 55', () => {
      const result = calculateRentIncrease(testInputs, 2);
      
      expect(result).toBeTruthy();
      expect(result?.order).toBe(55);
      expect(result?.increases).toHaveLength(2);
      
      // Year 1: 2.75% increase
      const year1Increase = result?.increases[0];
      expect(year1Increase?.percentIncrease).toBe(2.75);
      expect(year1Increase?.oldRent).toBe(1759.79);
      expect(year1Increase?.newRent).toBe(1808.18); // 1759.79 + (1759.79 * 0.0275 rounded)
      expect(year1Increase?.dollarIncrease).toBe(48.39);
      
      // Year 2: 3.25% on Year 1 rent
      const year2Increase = result?.increases[1];
      expect(year2Increase?.percentIncrease).toBe(3.25);
      expect(year2Increase?.oldRent).toBe(1808.18);
      expect(year2Increase?.newRent).toBe(1866.94); // 1808.18 + (1808.18 * 0.0325 rounded)
      expect(year2Increase?.dollarIncrease).toBe(58.76);
      
      // Test preferential rent calculations
      expect(result?.preferentialResult?.year1Amount).toBe(1758.82); // 1711.75 + (1711.75 * 0.0275 rounded)
      expect(result?.preferentialResult?.newTenantPay).toBe(1815.97); // 1758.82 + (1758.82 * 0.0325 rounded)
      
      // Test monthly breakdown
      expect(result?.monthlyBreakdown).toHaveLength(24);
      
      // Check first year months (1-12)
      for (let i = 0; i < 12; i++) {
        expect(result?.monthlyBreakdown?.[i].legalRent).toBe(1808.18);
        expect(result?.monthlyBreakdown?.[i].tenantPay).toBe(1758.82);
      }
      
      // Check second year months (13-24)
      for (let i = 12; i < 24; i++) {
        expect(result?.monthlyBreakdown?.[i].legalRent).toBe(1866.94);
        expect(result?.monthlyBreakdown?.[i].tenantPay).toBe(1815.97);
      }
    });
  });

  describe('calculateRentIncrease - Flat Rate (Order 54)', () => {
    const testInputs: CalculationInputs = {
      leaseStartDate: new Date('2023-01-01'),
      currentRent: 2000,
      preferentialRent: 1800
    };

    it('should calculate correct 1-year lease for flat rate', () => {
      const result = calculateRentIncrease(testInputs, 1);
      
      expect(result).toBeTruthy();
      expect(result?.order).toBe(54);
      expect(result?.increases).toHaveLength(1);
      
      const increase = result?.increases[0];
      expect(increase?.percentIncrease).toBe(3.25);
      expect(increase?.oldRent).toBe(2000);
      expect(increase?.newRent).toBe(2065.00); // 2000 + (2000 * 0.0325 rounded)
      expect(increase?.dollarIncrease).toBe(65.00);
      
      expect(result?.preferentialResult?.newTenantPay).toBe(1858.50); // 1800 + (1800 * 0.0325 rounded)
    });
  });

  describe('calculateRentIncrease - Split by Month (Order 53)', () => {
    const testInputs: CalculationInputs = {
      leaseStartDate: new Date('2022-01-01'),
      currentRent: 2000,
      preferentialRent: 1800
    };

    it('should calculate correct 1-year lease for split by month', () => {
      const result = calculateRentIncrease(testInputs, 1);
      
      expect(result).toBeTruthy();
      expect(result?.order).toBe(53);
      expect(result?.increases).toHaveLength(2);
      
      // First 6 months: 0%
      const firstPeriod = result?.increases[0];
      expect(firstPeriod?.percentIncrease).toBe(0.0);
      expect(firstPeriod?.oldRent).toBe(2000);
      expect(firstPeriod?.newRent).toBe(2000);
      expect(firstPeriod?.dollarIncrease).toBe(0);
      
      // Remaining months: 1.5%
      const secondPeriod = result?.increases[1];
      expect(secondPeriod?.percentIncrease).toBe(1.5);
      expect(secondPeriod?.oldRent).toBe(2000);
      expect(secondPeriod?.newRent).toBe(2030.00); // 2000 + (2000 * 0.015 rounded)
      expect(secondPeriod?.dollarIncrease).toBe(30.00);
      
      // Test monthly breakdown
      expect(result?.monthlyBreakdown).toHaveLength(12);
      
      // First 6 months
      for (let i = 0; i < 6; i++) {
        expect(result?.monthlyBreakdown?.[i].legalRent).toBe(2000);
        expect(result?.monthlyBreakdown?.[i].tenantPay).toBe(1800);
      }
      
      // Last 6 months
      for (let i = 6; i < 12; i++) {
        expect(result?.monthlyBreakdown?.[i].legalRent).toBe(2030);
        expect(result?.monthlyBreakdown?.[i].tenantPay).toBe(1827); // 1800 + (1800 * 0.015 rounded)
      }
    });
  });

  describe('Edge cases and precision', () => {
    it('should handle amounts that result in fractional cents correctly', () => {
      const testInputs: CalculationInputs = {
        leaseStartDate: new Date('2024-08-01'),
        currentRent: 1234.56,
        preferentialRent: 1111.11
      };

      const result = calculateRentIncrease(testInputs, 1);
      expect(result).toBeTruthy();
      
      // 1234.56 * 0.03 = 37.0368, rounded to 37.04
      expect(result?.increases[0]?.newRent).toBe(1271.60);
      expect(result?.preferentialResult?.newTenantPay).toBe(1144.44); // 1111.11 + 33.33
    });

    it('should handle no preferential rent', () => {
      const testInputs: CalculationInputs = {
        leaseStartDate: new Date('2024-08-01'),
        currentRent: 2000
      };

      const result = calculateRentIncrease(testInputs, 1);
      expect(result).toBeTruthy();
      expect(result?.preferentialResult).toBeUndefined();
    });

    it('should return null for invalid lease dates', () => {
      const testInputs: CalculationInputs = {
        leaseStartDate: new Date('2030-01-01'),
        currentRent: 2000
      };

      const result = calculateRentIncrease(testInputs, 1);
      expect(result).toBeNull();
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });
  });

  describe('formatPercent', () => {
    it('should format percentage correctly', () => {
      expect(formatPercent(3.25)).toBe('3.25%');
      expect(formatPercent(0)).toBe('0.00%');
      expect(formatPercent(100)).toBe('100.00%');
    });
  });
});