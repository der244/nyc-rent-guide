import React from 'react';
import { Copy, FileText, CheckCircle, AlertCircle, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalculationResult } from '../types/rgb';
import { formatCurrency, formatPercent, getGuideline, calculateRentIncrease } from '../utils/rentCalculator';
import { useToast } from '@/hooks/use-toast';

interface RentCalculatorResultsProps {
  result: {
    oneYear: CalculationResult;
    twoYear: CalculationResult;
  };
  inputs: {
    leaseStartDate: Date;
    currentRent: number;
    preferentialRent?: number;
    address?: string;
    unit?: string;
  };
}

export default function RentCalculatorResults({ result, inputs }: RentCalculatorResultsProps) {
  const { toast } = useToast();

  // Use the passed-in results instead of recalculating
  const scenarios = {
    oneYear: result.oneYear,
    twoYear: result.twoYear,
    effectivePeriod: `${getGuideline(inputs.leaseStartDate, 1)?.order.effective_from} to ${getGuideline(inputs.leaseStartDate, 1)?.order.effective_to}` || '',
    orderNumber: result.oneYear.order
  };

  const copyToClipboard = async () => {
    const oneYearGuideline = getGuideline(inputs.leaseStartDate, 1);
    const twoYearGuideline = getGuideline(inputs.leaseStartDate, 2);
    
    const getOneYearDetails = () => {
      if (!scenarios.oneYear) return 'N/A';
      const increases = scenarios.oneYear.increases;
      if (increases.length === 1) {
        return `${formatPercent(increases[0].percentIncrease)} → ${formatCurrency(scenarios.oneYear.newLegalRent)}`;
      } else if (increases.length === 2) {
        return `${formatPercent(increases[0].percentIncrease)} + ${formatPercent(increases[1].percentIncrease)} → ${formatCurrency(scenarios.oneYear.newLegalRent)}`;
      }
      return 'N/A';
    };

    const getTwoYearDetails = () => {
      if (!scenarios.twoYear) return 'N/A';
      const increases = scenarios.twoYear.increases;
      if (increases.length === 1) {
        return `${formatPercent(increases[0].percentIncrease)} → ${formatCurrency(scenarios.twoYear.newLegalRent)}`;
      } else if (increases.length === 2) {
        return `Year 1: ${formatPercent(increases[0].percentIncrease)} → ${formatCurrency(increases[0].newRent)} | Year 2: ${formatPercent(increases[1].percentIncrease)} → ${formatCurrency(increases[1].newRent)}`;
      }
      return 'N/A';
    };

    const readableText = `NYC RENT STABILIZED RENEWAL CALCULATION
RGB Order #${scenarios.orderNumber}
${inputs.address ? `\nPROPERTY: ${inputs.address}` : ''}${inputs.unit ? `\nUNIT: ${inputs.unit}` : ''}

CURRENT RENT: ${formatCurrency(inputs.currentRent)}${inputs.preferentialRent ? ` (Tenant Pays: ${formatCurrency(inputs.preferentialRent)})` : ''}
LEASE START: ${inputs.leaseStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}

1-YEAR LEASE:
• Legal Rent: ${getOneYearDetails()}${inputs.preferentialRent && scenarios.oneYear?.preferentialResult ? `\n• Tenant Pays: ${formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}` : ''}

2-YEAR LEASE:
• Legal Rent: ${getTwoYearDetails()}${inputs.preferentialRent && scenarios.twoYear?.preferentialResult ? `\n• Tenant Pays: ${formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}` : ''}

APPLIED RATES:
• 1-Year: ${oneYearGuideline?.rule.type === 'flat' ? 
  `${oneYearGuideline.rule.pct}%` :
  oneYearGuideline?.rule.type === 'split' ?
  `${oneYearGuideline.rule.year1_pct}% / ${oneYearGuideline.rule.year2_pct_on_year1_rent}%` :
  oneYearGuideline?.rule.type === 'split_by_month' ?
  `${oneYearGuideline.rule.first_pct}% / ${oneYearGuideline.rule.remaining_months_pct}%` :
  'N/A'}
• 2-Year: ${twoYearGuideline?.rule.type === 'flat' ? 
  `${twoYearGuideline.rule.pct}%` :
  twoYearGuideline?.rule.type === 'split' ?
  `${twoYearGuideline.rule.year1_pct}% / ${twoYearGuideline.rule.year2_pct_on_year1_rent}%` :
  twoYearGuideline?.rule.type === 'split_by_month' ?
  `${twoYearGuideline.rule.first_pct}% / ${twoYearGuideline.rule.remaining_months_pct}%` :
  'N/A'}

Calculated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
NYC rent-stabilized apartments only. Not legal advice. Confirm with HCR/RGB.`;

    try {
      await navigator.clipboard.writeText(readableText);
      toast({
        title: "Results copied to clipboard",
        description: "Clear calculation summary with all lease options and rates copied.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyLeaseAmount = async (amount: number, leaseType: string) => {
    try {
      await navigator.clipboard.writeText(formatCurrency(amount));
      toast({
        title: "Amount copied",
        description: `${leaseType} lease amount ${formatCurrency(amount)} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Print-only simplified view */}
      <div className="print-only hidden print:block print:space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">NYC Rent Stabilized Renewal Calculation</h1>
          <h2 className="text-lg text-gray-700">RGB Order #{scenarios.orderNumber}</h2>
          {inputs.address && (
            <p className="text-sm font-medium mt-2">
              <strong>Property:</strong> {inputs.address}
            </p>
          )}
          {inputs.unit && (
            <p className="text-sm font-medium">
              <strong>Unit:</strong> {inputs.unit}
            </p>
          )}
          <p className="text-sm">
            <strong>Lease Start Date:</strong> {inputs.leaseStartDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-sm">
            <strong>Effective Period:</strong> {new Date(scenarios.effectivePeriod.split(' to ')[0]).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} to {new Date(scenarios.effectivePeriod.split(' to ')[1]).toLocaleDateString('en-US', { 
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
            {inputs.preferentialRent 
              ? `${formatCurrency(inputs.currentRent)} / ${formatCurrency(inputs.preferentialRent)}`
              : formatCurrency(inputs.currentRent)
            }
          </p>
          <p className="text-sm mb-2">
            {inputs.preferentialRent 
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
                <div className="text-xl font-bold">{formatCurrency(inputs.currentRent)}</div>
                <div className="text-sm text-gray-600">Legal Regulated Rent</div>
              </td>
              <td className="text-center p-4">
                <div className="text-2xl font-bold text-green-700">
                  {scenarios.oneYear?.increases.length === 2 ? 
                    `${formatCurrency(scenarios.oneYear.increases[0].newRent)} / ${formatCurrency(scenarios.oneYear.increases[1].newRent)}` :
                    formatCurrency(scenarios.oneYear?.newLegalRent || inputs.currentRent)
                  }
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {scenarios.oneYear?.increases.length === 2 ? 
                    `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} / ${formatPercent(scenarios.oneYear.increases[1].percentIncrease)} | ${formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)} / ${formatCurrency(scenarios.oneYear.increases[1].dollarIncrease)}` :
                    `${formatPercent(scenarios.oneYear?.increases[0]?.percentIncrease || 0)} | ${formatCurrency(scenarios.oneYear?.increases[0]?.dollarIncrease || 0)}`
                  }
                </div>
              </td>
              <td className="text-center p-4">
                <div className="text-2xl font-bold text-green-700">
                  {scenarios.twoYear?.increases.length === 2 ? 
                    `${formatCurrency(scenarios.twoYear.increases[0].newRent)} / ${formatCurrency(scenarios.twoYear.increases[1].newRent)}` :
                    formatCurrency(scenarios.twoYear?.newLegalRent || inputs.currentRent)
                  }
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {scenarios.twoYear?.increases.length === 2 ? 
                    `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)} / ${formatPercent(scenarios.twoYear.increases[1].percentIncrease)} | ${formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)} / ${formatCurrency(scenarios.twoYear.increases[1].dollarIncrease)}` :
                    `${formatPercent(scenarios.twoYear?.increases[0]?.percentIncrease || 0)} | ${formatCurrency(scenarios.twoYear?.increases[0]?.dollarIncrease || 0)}`
                  }
                </div>
              </td>
            </tr>
            
            {/* Preferential Rent Row (if applicable) */}
            {inputs.preferentialRent && (
              <tr className="border-b border-gray-300">
                <td className="p-4">
                  <div className="text-xl font-bold">{formatCurrency(inputs.preferentialRent)}</div>
                  <div className="text-sm text-gray-600">Tenant Currently Pays (Preferential)</div>
                </td>
                <td className="text-center p-4">
                  {scenarios.oneYear?.preferentialResult && (
                    <>
                      <div className="text-2xl font-bold text-blue-700">
                        {scenarios.oneYear.increases.length === 2 && scenarios.oneYear.preferentialResult.year1Amount ? 
                          `${formatCurrency(scenarios.oneYear.preferentialResult.year1Amount)} / ${formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}` :
                          formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)
                        }
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {scenarios.oneYear.increases.length === 2 && scenarios.oneYear.preferentialResult.year1Amount ? 
                          `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} / ${formatPercent(scenarios.oneYear.increases[1].percentIncrease)} | ${formatCurrency(inputs.preferentialRent! * scenarios.oneYear.increases[0].percentIncrease / 100)} / ${formatCurrency((scenarios.oneYear.preferentialResult.year1Amount || inputs.preferentialRent!) * scenarios.oneYear.increases[1].percentIncrease / 100)}` :
                          `${formatPercent(scenarios.oneYear?.increases[0]?.percentIncrease || 0)} | ${formatCurrency((scenarios.oneYear.preferentialResult?.newTenantPay || 0) - (inputs.preferentialRent || 0))}`
                        }
                      </div>
                    </>
                  )}
                </td>
                <td className="text-center p-4">
                  {scenarios.twoYear?.preferentialResult && (
                    <>
                      <div className="text-2xl font-bold text-blue-700">
                        {scenarios.twoYear.increases.length === 2 && scenarios.twoYear.preferentialResult.year1Amount ? 
                          `${formatCurrency(scenarios.twoYear.preferentialResult.year1Amount)} / ${formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}` :
                          formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)
                        }
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {scenarios.twoYear.increases.length === 2 && scenarios.twoYear.preferentialResult.year1Amount ? 
                          `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)} / ${formatPercent(scenarios.twoYear.increases[1].percentIncrease)} | ${formatCurrency(inputs.preferentialRent! * scenarios.twoYear.increases[0].percentIncrease / 100)} / ${formatCurrency((scenarios.twoYear.preferentialResult.year1Amount || inputs.preferentialRent!) * scenarios.twoYear.increases[1].percentIncrease / 100)}` :
                          `${formatPercent(scenarios.twoYear?.increases[0]?.percentIncrease || 0)} | ${formatCurrency((scenarios.twoYear.preferentialResult?.newTenantPay || 0) - (inputs.preferentialRent || 0))}`
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

      {/* Screen-only detailed view */}
      {scenarios && (
        <Card className="w-full shadow-lg border-0 print:hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
          <CardHeader className="bg-gradient-to-r from-calculator-success to-calculator-success/90 text-white rounded-t-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  RGB Order #{scenarios.orderNumber} - Renewal Calculation
                </CardTitle>
                {(inputs.address || inputs.unit) && (
                  <div className="mt-2 text-sm text-white/90 space-y-1">
                    {inputs.address && <div>📍 {inputs.address}</div>}
                    {inputs.unit && <div>🏠 Unit {inputs.unit}</div>}
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button onClick={copyToClipboard} variant="outline" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm">
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Copy Results
                </Button>
                <Button onClick={() => {
                  // Set document title for meaningful filename
                  const currentTitle = document.title;
                  const date = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-');
                  const addressPart = inputs.address ? `-${inputs.address.split(',')[0].replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}` : '';
                  const unitPart = inputs.unit ? `-${inputs.unit.replace(/\s/g, '')}` : '';
                  document.title = `NYC-Rent-Calculation-${date}${addressPart}${unitPart}-RGB${scenarios.orderNumber}`;
                  
                  window.print();
                  
                  // Restore original title after print
                  setTimeout(() => {
                    document.title = currentTitle;
                  }, 1000);
                }} variant="outline" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Print
                </Button>
              </div>
            </div>
            <p className="text-white/90 text-xs sm:text-sm mt-2 leading-relaxed">
              Effective Period: {new Date(scenarios.effectivePeriod.split(' to ')[0]).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} to {new Date(scenarios.effectivePeriod.split(' to ')[1]).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="w-full">
              {/* Mobile-first vertical layout for results */}
              <div className="block md:hidden space-y-4">
                {/* Mobile: Vertical Cards Layout */}
                <div className="space-y-4">
                  {/* Renewal Dates Card */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold text-sm mb-3 text-foreground">Renewal Dates</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xs text-foreground/80 mb-1">1-Year Lease Ends</div>
                        <div className="text-sm font-semibold text-foreground">
                          {new Date(inputs.leaseStartDate.getFullYear() + 1, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-foreground/80 mb-1">2-Year Lease Ends</div>
                        <div className="text-sm font-semibold text-foreground">
                          {new Date(inputs.leaseStartDate.getFullYear() + 2, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Rent Card */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold text-base mb-3 text-foreground">Current Rent</h3>
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-foreground">{formatCurrency(inputs.currentRent)}</div>
                      <div className="text-sm text-foreground/70">Legal Regulated Rent</div>
                      <div className="flex justify-center">
                        <Button
                          onClick={() => copyLeaseAmount(inputs.currentRent, "Current")}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {inputs.preferentialRent && (
                      <div className="mt-4 pt-3 border-t border-muted">
                        <div className="text-center space-y-2">
                          <div className="text-2xl font-bold text-foreground">{formatCurrency(inputs.preferentialRent)}</div>
                          <div className="text-sm text-foreground/70">Preferential Rent (Tenant Pays)</div>
                          <div className="flex justify-center">
                            <Button
                              onClick={() => copyLeaseAmount(inputs.preferentialRent!, "Preferential")}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 1-Year Lease Card */}
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <h3 className="font-semibold text-base mb-3 text-green-800">1-Year Lease Option</h3>
                    <div className="space-y-3">
                      <div className="text-center">
                        {scenarios.oneYear?.increases.length === 2 ? (
                          <div className="space-y-2">
                            <div className="text-2xl font-bold text-green-700">
                              {formatCurrency(scenarios.oneYear.increases[0].newRent)} / {formatCurrency(scenarios.oneYear.increases[1].newRent)}
                            </div>
                            <div className="text-sm text-green-800">Legal Regulated Rent</div>
                            <div className="flex justify-center gap-2">
                              <Button
                                onClick={() => copyLeaseAmount(scenarios.oneYear.increases[0].newRent, "1-Year (Year 1)")}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => copyLeaseAmount(scenarios.oneYear.increases[1].newRent, "1-Year (Year 2)")}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-2xl font-bold text-green-700">
                              {formatCurrency(scenarios.oneYear?.newLegalRent || inputs.currentRent)}
                            </div>
                            <div className="text-sm text-green-800">Legal Regulated Rent</div>
                            <div className="flex justify-center">
                              <Button
                                onClick={() => copyLeaseAmount(scenarios.oneYear?.newLegalRent || inputs.currentRent, "1-Year")}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">
                          {scenarios.oneYear?.increases.length === 2 ? 
                            `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} / ${formatPercent(scenarios.oneYear.increases[1].percentIncrease)}` :
                            `${formatPercent(scenarios.oneYear?.increases[0]?.percentIncrease || 0)} increase`
                          }
                        </div>
                      </div>
                      
                      {inputs.preferentialRent && scenarios.oneYear?.preferentialResult && (
                        <div className="pt-3 border-t border-green-200 text-center">
                          {scenarios.oneYear.increases.length === 2 && scenarios.oneYear.preferentialResult.year1Amount ? (
                            <div className="space-y-2">
                              <div className="text-lg font-bold text-blue-700">
                                {formatCurrency(scenarios.oneYear.preferentialResult.year1Amount)} / {formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}
                              </div>
                              <div className="text-sm text-blue-800">Preferential Rent (Tenant Pays)</div>
                                <div className="flex justify-center gap-2">
                                  <Button
                                    onClick={() => copyLeaseAmount(scenarios.oneYear.preferentialResult.year1Amount!, "1-Year Preferential (Year 1)")}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => copyLeaseAmount(scenarios.oneYear.preferentialResult.newTenantPay, "1-Year Preferential (Year 2)")}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="text-lg font-bold text-blue-700">
                                {formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}
                              </div>
                              <div className="text-sm text-blue-800">Preferential Rent (Tenant Pays)</div>
                              <div className="flex justify-center">
                                <Button
                                  onClick={() => copyLeaseAmount(scenarios.oneYear.preferentialResult.newTenantPay, "1-Year Preferential")}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2-Year Lease Card */}
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h3 className="font-semibold text-base mb-3 text-blue-800">2-Year Lease Option</h3>
                    <div className="space-y-3">
                      <div className="text-center">
                        {scenarios.twoYear?.increases.length === 2 ? (
                          <div className="space-y-2">
                            <div className="text-2xl font-bold text-blue-700">
                              {formatCurrency(scenarios.twoYear.increases[0].newRent)} / {formatCurrency(scenarios.twoYear.increases[1].newRent)}
                            </div>
                            <div className="text-sm text-blue-800">Legal Regulated Rent</div>
                            <div className="flex justify-center gap-2">
                              <Button
                                onClick={() => copyLeaseAmount(scenarios.twoYear.increases[0].newRent, "2-Year (Year 1)")}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => copyLeaseAmount(scenarios.twoYear.increases[1].newRent, "2-Year (Year 2)")}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-2xl font-bold text-blue-700">
                              {formatCurrency(scenarios.twoYear?.newLegalRent || inputs.currentRent)}
                            </div>
                            <div className="text-sm text-blue-800">Legal Regulated Rent</div>
                            <div className="flex justify-center">
                              <Button
                                onClick={() => copyLeaseAmount(scenarios.twoYear?.newLegalRent || inputs.currentRent, "2-Year")}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">
                          {scenarios.twoYear?.increases.length === 2 ? 
                            `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)} / ${formatPercent(scenarios.twoYear.increases[1].percentIncrease)}` :
                            `${formatPercent(scenarios.twoYear?.increases[0]?.percentIncrease || 0)} increase`
                          }
                        </div>
                      </div>
                      
                      {inputs.preferentialRent && scenarios.twoYear?.preferentialResult && (
                        <div className="pt-3 border-t border-blue-200 text-center">
                          {scenarios.twoYear.increases.length === 2 && scenarios.twoYear.preferentialResult.year1Amount ? (
                            <div className="space-y-2">
                              <div className="text-lg font-bold text-blue-700">
                                {formatCurrency(scenarios.twoYear.preferentialResult.year1Amount)} / {formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}
                              </div>
                              <div className="text-sm text-blue-800">Preferential Rent (Tenant Pays)</div>
                                <div className="flex justify-center gap-2">
                                  <Button
                                    onClick={() => copyLeaseAmount(scenarios.twoYear.preferentialResult.year1Amount!, "2-Year Preferential (Year 1)")}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => copyLeaseAmount(scenarios.twoYear.preferentialResult.newTenantPay, "2-Year Preferential (Year 2)")}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="text-lg font-bold text-blue-700">
                                {formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}
                              </div>
                              <div className="text-sm text-blue-800">Preferential Rent (Tenant Pays)</div>
                              <div className="flex justify-center">
                                <Button
                                  onClick={() => copyLeaseAmount(scenarios.twoYear.preferentialResult.newTenantPay, "2-Year Preferential")}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop: Compact Table Layout */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold text-sm sm:text-base min-w-[120px] text-foreground">Current Rent</TableHead>
                        <TableHead className="text-center font-semibold text-sm sm:text-base min-w-[140px] text-foreground">1-Year Lease</TableHead>
                        <TableHead className="text-center font-semibold text-sm sm:text-base min-w-[140px] text-foreground">2-Year Lease</TableHead>
                      </TableRow>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold text-sm sm:text-base py-4 text-foreground">Lease end dates</TableHead>
                        <TableHead className="text-center font-semibold text-sm sm:text-base py-4 text-foreground">
                          Ends: {new Date(inputs.leaseStartDate.getFullYear() + 1, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
                        </TableHead>
                        <TableHead className="text-center font-semibold text-sm sm:text-base py-4 text-foreground">
                          Ends: {new Date(inputs.leaseStartDate.getFullYear() + 2, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Legal Rent Row */}
                      <TableRow className="border-b-2">
                         <TableCell className="font-bold text-base sm:text-lg">
                          <div className="space-y-2">
                            <div className="text-left text-base sm:text-xl font-bold text-calculator-success">{formatCurrency(inputs.currentRent)}</div>
                            <div className="flex justify-center">
                              <Button
                                onClick={() => copyLeaseAmount(inputs.currentRent, "Current Legal Rent")}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-left text-sm text-foreground/60">Legal Regulated Rent</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center px-2">
                          <div className="space-y-2">
                            <div className="text-base sm:text-xl font-bold text-calculator-success break-words">
                              {scenarios.oneYear?.increases.length === 2 ? 
                                `${formatCurrency(scenarios.oneYear.increases[0].newRent)} / ${formatCurrency(scenarios.oneYear.increases[1].newRent)}` :
                                formatCurrency(scenarios.oneYear?.newLegalRent || inputs.currentRent)
                              }
                            </div>
                            <div className="text-sm text-foreground/60">Legal Regulated Rent</div>
                            {scenarios.oneYear?.increases.length === 2 ? (
                              <div className="flex justify-center gap-1">
                                <Button
                                  onClick={() => copyLeaseAmount(scenarios.oneYear.increases[0].newRent, "1-Year (Year 1)")}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => copyLeaseAmount(scenarios.oneYear.increases[1].newRent, "1-Year (Year 2)")}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <Button
                                  onClick={() => copyLeaseAmount(scenarios.oneYear?.newLegalRent || inputs.currentRent, "1-Year")}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {scenarios.oneYear?.increases.length === 1 
                                ? `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} increase`
                                : scenarios.oneYear?.increases.length === 2
                                ? `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} + ${formatPercent(scenarios.oneYear.increases[1].percentIncrease)}`
                                : 'N/A'
                              }
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center px-2">
                          <div className="space-y-2">
                            <div className="text-base sm:text-xl font-bold text-calculator-success break-words">
                              {scenarios.twoYear?.increases.length === 2 ? 
                                `${formatCurrency(scenarios.twoYear.increases[0].newRent)} / ${formatCurrency(scenarios.twoYear.increases[1].newRent)}` :
                                formatCurrency(scenarios.twoYear?.newLegalRent || inputs.currentRent)
                              }
                            </div>
                            <div className="text-sm text-foreground/60">Legal Regulated Rent</div>
                            {scenarios.twoYear?.increases.length === 2 ? (
                              <div className="flex justify-center gap-1">
                                <Button
                                  onClick={() => copyLeaseAmount(scenarios.twoYear.increases[0].newRent, "2-Year (Year 1)")}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => copyLeaseAmount(scenarios.twoYear.increases[1].newRent, "2-Year (Year 2)")}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <Button
                                  onClick={() => copyLeaseAmount(scenarios.twoYear?.newLegalRent || inputs.currentRent, "2-Year")}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {scenarios.twoYear?.increases.length === 1 
                                ? `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)} increase`
                                : scenarios.twoYear?.increases.length === 2
                                ? `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)} + ${formatPercent(scenarios.twoYear.increases[1].percentIncrease)}`
                                : 'Split increase'
                              }
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Preferential rent row if applicable */}
                      {inputs.preferentialRent && scenarios.oneYear?.preferentialResult && scenarios.twoYear?.preferentialResult && (
                        <TableRow className="bg-calculator-info/5">
                          <TableCell className="font-semibold text-calculator-info text-base sm:text-lg">
                            <div className="text-center space-y-2">
                              <div className="text-2xl font-bold">{formatCurrency(inputs.preferentialRent)}</div>
                              <div className="text-sm text-foreground/60">Preferential Rent (Tenant Pays)</div>
                              <div className="flex justify-center">
                                <Button
                                  onClick={() => copyLeaseAmount(inputs.preferentialRent!, "Current Preferential")}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center px-2">
                            <div className="space-y-2">
                              <div className="font-semibold text-calculator-info text-base sm:text-xl break-words">
                                {scenarios.oneYear.increases.length === 2 && scenarios.oneYear.preferentialResult.year1Amount ? 
                                  `${formatCurrency(scenarios.oneYear.preferentialResult.year1Amount)} / ${formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}` :
                                  formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)
                                }
                              </div>
                              <div className="text-sm text-foreground/60">Preferential Rent (Tenant Pays)</div>
                              {scenarios.oneYear?.increases.length === 2 && scenarios.oneYear.preferentialResult.year1Amount ? (
                                <div className="flex justify-center gap-1">
                                  <Button
                                    onClick={() => copyLeaseAmount(scenarios.oneYear.preferentialResult.year1Amount!, "1-Year Preferential (Year 1)")}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => copyLeaseAmount(scenarios.oneYear.preferentialResult.newTenantPay, "1-Year Preferential (Year 2)")}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex justify-center">
                                  <Button
                                    onClick={() => copyLeaseAmount(scenarios.oneYear.preferentialResult.newTenantPay, "1-Year Preferential")}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {scenarios.oneYear?.increases.length === 1 
                                  ? `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} increase`
                                  : scenarios.oneYear?.increases.length === 2
                                  ? `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} + ${formatPercent(scenarios.oneYear.increases[1].percentIncrease)}`
                                  : 'N/A'
                                }
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center px-2">
                            <div className="space-y-2">
                              <div className="font-semibold text-calculator-info text-base sm:text-xl break-words">
                                {scenarios.twoYear?.preferentialResult && scenarios.twoYear.increases.length === 2 && scenarios.twoYear.preferentialResult.year1Amount ? 
                                  `${formatCurrency(scenarios.twoYear.preferentialResult.year1Amount)} / ${formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}` :
                                  formatCurrency(scenarios.twoYear?.preferentialResult?.newTenantPay || inputs.preferentialRent!)
                                }
                              </div>
                              <div className="text-sm text-foreground/60">Preferential Rent (Tenant Pays)</div>
                              {scenarios.twoYear?.preferentialResult && scenarios.twoYear.increases.length === 2 && scenarios.twoYear.preferentialResult.year1Amount ? (
                                <div className="flex justify-center gap-1">
                                  <Button
                                    onClick={() => copyLeaseAmount(scenarios.twoYear.preferentialResult.year1Amount!, "2-Year Preferential (Year 1)")}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => copyLeaseAmount(scenarios.twoYear.preferentialResult.newTenantPay, "2-Year Preferential (Year 2)")}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex justify-center">
                                  <Button
                                    onClick={() => copyLeaseAmount(scenarios.twoYear?.preferentialResult?.newTenantPay || inputs.preferentialRent!, "2-Year Preferential")}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-black hover:bg-gray-100"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {scenarios.twoYear?.increases.length === 1 
                                  ? `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)} increase`
                                  : scenarios.twoYear?.increases.length === 2
                                  ? `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)} + ${formatPercent(scenarios.twoYear.increases[1].percentIncrease)}`
                                  : 'Split increase'
                                }
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Applied rule and breakdown */}
            <div className="mt-6">
              <div className="text-base">
                <span className="font-medium text-muted-foreground">Applied Rule: </span>
                <div className="mt-2 space-y-2">
                  {(() => {
                    const oneYearGuideline = getGuideline(inputs.leaseStartDate, 1);
                    const twoYearGuideline = getGuideline(inputs.leaseStartDate, 2);
                    
                    const oneYearPct = oneYearGuideline?.rule.type === 'flat' ? 
                      `${oneYearGuideline.rule.pct}%` :
                      oneYearGuideline?.rule.type === 'split' ?
                      `${oneYearGuideline.rule.year1_pct}% / ${oneYearGuideline.rule.year2_pct_on_year1_rent}%` :
                      oneYearGuideline?.rule.type === 'split_by_month' ?
                      `${oneYearGuideline.rule.first_pct}% / ${oneYearGuideline.rule.remaining_months_pct}%` :
                      'N/A';
                    
                    const twoYearPct = twoYearGuideline?.rule.type === 'flat' ? 
                      `${twoYearGuideline.rule.pct}%` :
                      twoYearGuideline?.rule.type === 'split' ?
                      `${twoYearGuideline.rule.year1_pct}% / ${twoYearGuideline.rule.year2_pct_on_year1_rent}%` :
                      twoYearGuideline?.rule.type === 'split_by_month' ?
                      `${twoYearGuideline.rule.first_pct}% / ${twoYearGuideline.rule.remaining_months_pct}%` :
                      'N/A';
                    
                    return (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">1-Year: {oneYearPct}</span>
                          <Button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(oneYearPct);
                                toast({
                                  title: "Copied",
                                  description: `1-Year rate ${oneYearPct} copied to clipboard`,
                                });
                              } catch (err) {
                                toast({
                                  title: "Copy failed",
                                  description: "Unable to copy to clipboard. Please try again.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">2-Year: {twoYearPct}</span>
                          <Button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(twoYearPct);
                                toast({
                                  title: "Copied",
                                  description: `2-Year rate ${twoYearPct} copied to clipboard`,
                                });
                              } catch (err) {
                                toast({
                                  title: "Copy failed",
                                  description: "Unable to copy to clipboard. Please try again.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notice - Screen only */}
      <Card className="w-full border-calculator-warning/50 bg-calculator-warning/5 print:hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-calculator-warning mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-calculator-warning">Important Disclaimer</p>
              <p className="text-foreground/80">
                This calculation is for NYC rent-stabilized apartments only and is not legal advice. 
                Please confirm with the NYC Housing and Community Renewal (HCR) or Rent Guidelines Board (RGB). 
                Vacancy allowances, Major Capital Improvements (MCI), Individual Apartment Improvements (IAI), 
                and other adjustments are not included in this calculation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}