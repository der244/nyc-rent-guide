import React from 'react';
import { CalculationResult } from '@/types/rgb';
import { formatCurrency, formatPercent } from '@/utils/rentCalculator';

interface PrintViewProps {
  orderNumber: number;
  address?: string;
  unit?: string;
  leaseStartDate: Date;
  effectivePeriod: string;
  currentRent: number;
  preferentialRent?: number;
  oneYear: CalculationResult;
  twoYear: CalculationResult;
}

export default function PrintView({
  orderNumber,
  address,
  unit,
  leaseStartDate,
  effectivePeriod,
  currentRent,
  preferentialRent,
  oneYear,
  twoYear
}: PrintViewProps) {
  return (
    <div className="print-only hidden print:block print:space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">NYC Rent Stabilized Renewal Calculation</h1>
        <h2 className="text-lg text-gray-700">RGB Order #{orderNumber}</h2>
        {address && (
          <p className="text-sm font-medium mt-2">
            <strong>Property:</strong> {address}
          </p>
        )}
        {unit && (
          <p className="text-sm font-medium">
            <strong>Unit:</strong> {unit}
          </p>
        )}
        <p className="text-sm">
          <strong>Lease Start Date:</strong> {leaseStartDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <p className="text-sm">
          <strong>Effective Period:</strong> {new Date(effectivePeriod.split(' to ')[0]).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} to {new Date(effectivePeriod.split(' to ')[1]).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <p className="text-sm text-gray-600"><strong>Calculated on:</strong> {new Date().toLocaleDateString()}</p>
      </div>

      <div className="border border-gray-300 p-4 mb-4">
        <h3 className="font-bold text-lg mb-3">Current Rent Information</h3>
        <p className="text-xl font-bold mb-2">
          {preferentialRent 
            ? `${formatCurrency(currentRent)} / ${formatCurrency(preferentialRent)}`
            : formatCurrency(currentRent)
          }
        </p>
        <p className="text-sm mb-2">
          {preferentialRent 
            ? "Legal / Preferential Rent (Tenant Currently Pays)"
            : "Legal Regulated Rent"
          }
        </p>
      </div>

      <table className="w-full border border-gray-300 mb-6">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left p-4 font-bold">Current Rent</th>
            <th className="text-center p-4 font-bold">1-Year Lease Option</th>
            <th className="text-center p-4 font-bold">2-Year Lease Option</th>
          </tr>
        </thead>
        <tbody>
          {/* Legal Rent Row */}
          <tr className="border-b-2 border-gray-400">
            <td className="p-4">
              <div className="text-xl font-bold">{formatCurrency(currentRent)}</div>
              <div className="text-sm text-gray-600">Legal Regulated Rent</div>
            </td>
            <td className="text-center p-4">
              <div className="text-2xl font-bold text-green-700">
                {oneYear.increases.length === 2 ? 
                  `${formatCurrency(oneYear.increases[0].newRent)} / ${formatCurrency(oneYear.increases[1].newRent)}` :
                  formatCurrency(oneYear.newLegalRent)
                }
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {oneYear.increases.length === 2 ? 
                  `${formatPercent(oneYear.increases[0].percentIncrease)} / ${formatPercent(oneYear.increases[1].percentIncrease)} | ${formatCurrency(oneYear.increases[0].dollarIncrease)} / ${formatCurrency(oneYear.increases[1].dollarIncrease)}` :
                  `${formatPercent(oneYear.increases[0].percentIncrease)} | ${formatCurrency(oneYear.increases[0].dollarIncrease)}`
                }
              </div>
            </td>
            <td className="text-center p-4">
              <div className="text-2xl font-bold text-green-700">
                {twoYear.increases.length === 2 ? 
                  `${formatCurrency(twoYear.increases[0].newRent)} / ${formatCurrency(twoYear.increases[1].newRent)}` :
                  formatCurrency(twoYear.newLegalRent)
                }
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {twoYear.increases.length === 2 ? 
                  `${formatPercent(twoYear.increases[0].percentIncrease)} / ${formatPercent(twoYear.increases[1].percentIncrease)} | ${formatCurrency(twoYear.increases[0].dollarIncrease)} / ${formatCurrency(twoYear.increases[1].dollarIncrease)}` :
                  `${formatPercent(twoYear.increases[0].percentIncrease)} | ${formatCurrency(twoYear.increases[0].dollarIncrease)}`
                }
              </div>
            </td>
          </tr>
          
          {/* Preferential Rent Row (if applicable) */}
          {preferentialRent && (
            <tr className="border-b border-gray-300">
              <td className="p-4">
                <div className="text-xl font-bold">{formatCurrency(preferentialRent)}</div>
                <div className="text-sm text-gray-600">Tenant Currently Pays (Preferential)</div>
              </td>
              <td className="text-center p-4">
                {oneYear.preferentialResult && (
                  <>
                    <div className="text-2xl font-bold text-blue-700">
                      {oneYear.increases.length === 2 && oneYear.preferentialResult.year1Amount ? 
                        `${formatCurrency(oneYear.preferentialResult.year1Amount)} / ${formatCurrency(oneYear.preferentialResult.newTenantPay)}` :
                        formatCurrency(oneYear.preferentialResult.newTenantPay)
                      }
                    </div>
                  </>
                )}
              </td>
              <td className="text-center p-4">
                {twoYear.preferentialResult && (
                  <>
                    <div className="text-2xl font-bold text-blue-700">
                      {twoYear.increases.length === 2 && twoYear.preferentialResult.year1Amount ? 
                        `${formatCurrency(twoYear.preferentialResult.year1Amount)} / ${formatCurrency(twoYear.preferentialResult.newTenantPay)}` :
                        formatCurrency(twoYear.preferentialResult.newTenantPay)
                      }
                    </div>
                  </>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}