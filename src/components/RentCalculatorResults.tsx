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

  const copyLeaseAmount = async (amount: number, leaseType: '1-year' | '2-year') => {
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
    <div className="space-y-6">
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
          <p className="text-xl font-bold mb-2">{formatCurrency(inputs.currentRent)}</p>
          <p className="text-sm mb-2">Legal Regulated Rent</p>
          {inputs.preferentialRent && (
            <>
              <p className="text-lg font-bold text-blue-700">{formatCurrency(inputs.preferentialRent)}</p>
              <p className="text-sm">Current Preferential Rent (Tenant Currently Pays)</p>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border border-gray-300 p-4">
            <h3 className="font-bold text-lg mb-3">1-Year Lease Option</h3>
            <p className="text-xl font-bold text-green-700">{formatCurrency(scenarios.oneYear?.newLegalRent || inputs.currentRent)}</p>
            <p className="text-sm">
              {scenarios.oneYear?.increases.length === 1 
                ? `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} increase (+${formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)})`
                : scenarios.oneYear?.increases.length === 2
                ? `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} + ${formatPercent(scenarios.oneYear.increases[1].percentIncrease)} increase (+${formatCurrency(scenarios.oneYear.increases.reduce((sum, inc) => sum + inc.dollarIncrease, 0))})`
                : 'N/A'
              }
            </p>
            {inputs.preferentialRent && scenarios.oneYear?.preferentialResult && (
              <div className="mt-3 pt-2 border-t border-gray-200">
                <p className="text-sm font-medium">Tenant Pays (Preferential):</p>
                <p className="text-lg font-bold text-blue-700">{formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}</p>
              </div>
            )}
          </div>

          <div className="border border-gray-300 p-4">
            <h3 className="font-bold text-lg mb-3">2-Year Lease Option</h3>
            <p className="text-xl font-bold text-green-700">{formatCurrency(scenarios.twoYear?.newLegalRent || inputs.currentRent)}</p>
            <p className="text-sm">
              {scenarios.twoYear?.increases.length === 1 
                ? `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)} increase (+${formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)})`
                : scenarios.twoYear?.increases.length === 2
                ? `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)} + ${formatPercent(scenarios.twoYear.increases[1].percentIncrease)} increase (+${formatCurrency(scenarios.twoYear.increases.reduce((sum, inc) => sum + inc.dollarIncrease, 0))})`
                : 'Split increase over 2 years'
              }
            </p>
            {inputs.preferentialRent && scenarios.twoYear?.preferentialResult && (
              <div className="mt-3 pt-2 border-t border-gray-200">
                <p className="text-sm font-medium">Tenant Pays (Preferential):</p>
                <p className="text-lg font-bold text-blue-700">{formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="border border-gray-300 p-4 mb-4">
          <h3 className="font-bold mb-2">Applied Rules</h3>
          <p className="text-sm">
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
              
              return `1-Year: ${oneYearPct} | 2-Year: ${twoYearPct}`;
            })()}
          </p>
        </div>

        <div className="border border-gray-300 p-4 text-sm">
          <p className="font-medium mb-2">Important Disclaimer</p>
          <p>
            This calculation is for NYC rent-stabilized apartments only and is not legal advice. 
            Please confirm with the NYC Housing and Community Renewal (HCR) or Rent Guidelines Board (RGB). 
            Vacancy allowances, Major Capital Improvements (MCI), Individual Apartment Improvements (IAI), 
            and other adjustments are not included in this calculation.
          </p>
        </div>
      </div>

      {/* Screen-only detailed view */}
      {scenarios && (
        <Card className="shadow-lg border-0 print:hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
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
          <CardContent className="p-3 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold w-[120px] sm:w-[140px] text-xs sm:text-sm">Current Rent</TableHead>
                    <TableHead className="text-center font-semibold text-xs sm:text-sm">1-Year Lease</TableHead>
                    <TableHead className="text-center font-semibold text-xs sm:text-sm">2-Year Lease</TableHead>
                  </TableRow>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-muted-foreground text-xs">Starting Amount</TableHead>
                    <TableHead className="text-center text-muted-foreground text-xs px-1">
                      New Amount | % Increase | $ Increase
                    </TableHead>
                    <TableHead className="text-center text-muted-foreground text-xs px-1">
                      New Amount | % Increase | $ Increase
                    </TableHead>
                  </TableRow>
                  <TableRow className="bg-muted/20">
                    <TableHead className="text-muted-foreground text-xs">Lease End Date</TableHead>
                    <TableHead className="text-center text-muted-foreground text-xs px-1">
                      {new Date(inputs.leaseStartDate.getFullYear() + 1, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
                    </TableHead>
                    <TableHead className="text-center text-muted-foreground text-xs px-1">
                      {new Date(inputs.leaseStartDate.getFullYear() + 2, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Main rent calculation row */}
                  <TableRow className="border-b-2">
                    <TableCell className="font-bold text-base sm:text-lg">
                      {formatCurrency(inputs.currentRent)}
                      <div className="text-xs text-muted-foreground">Legal Regulated Rent</div>
                    </TableCell>
                    <TableCell className="text-center space-y-1 px-1 sm:px-3">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                        <div className="text-sm sm:text-lg font-bold text-calculator-success break-words">
                          {scenarios.oneYear?.increases.length === 2 
                            ? `${formatCurrency(scenarios.oneYear.increases[0].newRent)} / ${formatCurrency(scenarios.oneYear.newLegalRent)}`
                            : formatCurrency(scenarios.oneYear?.newLegalRent || inputs.currentRent)
                          }
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-muted flex-shrink-0"
                          onClick={() => copyLeaseAmount(scenarios.oneYear?.newLegalRent || inputs.currentRent, '1-year')}
                        >
                          <Copy className="h-2 w-2 sm:h-3 sm:w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground leading-tight">
                        {scenarios.oneYear?.increases.length === 1 
                          ? `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} | +${formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)}`
                          : scenarios.oneYear?.increases.length === 2
                          ? (
                              <div className="space-y-1">
                                <div>{formatPercent(scenarios.oneYear.increases[0].percentIncrease)} + {formatPercent(scenarios.oneYear.increases[1].percentIncrease)} | +{formatCurrency(scenarios.oneYear.increases.reduce((sum, inc) => sum + inc.dollarIncrease, 0))}</div>
                                <div className="text-xs italic">
                                  {scenarios.oneYear.increases[0].period} / {scenarios.oneYear.increases[1].period}
                                </div>
                              </div>
                            )
                          : 'N/A'
                        }
                      </div>
                    </TableCell>
                    <TableCell className="text-center space-y-1 px-1 sm:px-3">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                        <div className="text-sm sm:text-lg font-bold text-calculator-success break-words">
                          {scenarios.twoYear?.increases.length === 2 
                            ? `${formatCurrency(scenarios.twoYear.increases[0].newRent)} / ${formatCurrency(scenarios.twoYear.newLegalRent)}`
                            : formatCurrency(scenarios.twoYear?.newLegalRent || inputs.currentRent)
                          }
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-muted flex-shrink-0"
                          onClick={() => copyLeaseAmount(scenarios.twoYear?.newLegalRent || inputs.currentRent, '2-year')}
                        >
                          <Copy className="h-2 w-2 sm:h-3 sm:w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground leading-tight">
                        {scenarios.twoYear?.increases.length === 1 
                          ? `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)} | +${formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)}`
                          : scenarios.twoYear?.increases.length === 2
                          ? (
                              <div className="space-y-1">
                                <div>{formatPercent(scenarios.twoYear.increases[0].percentIncrease)} + {formatPercent(scenarios.twoYear.increases[1].percentIncrease)} | +{formatCurrency(scenarios.twoYear.increases.reduce((sum, inc) => sum + inc.dollarIncrease, 0))}</div>
                                <div className="text-xs italic">Year 1 / Year 2 amounts shown above</div>
                              </div>
                            )
                          : 'Split increase'
                        }
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Preferential rent row if applicable */}
                  {inputs.preferentialRent && scenarios.oneYear?.preferentialResult && scenarios.twoYear?.preferentialResult && (
                    <TableRow className="bg-calculator-info/5">
                      <TableCell className="font-semibold text-calculator-info">
                        {formatCurrency(inputs.preferentialRent)}
                        <div className="text-xs text-muted-foreground">Preferential Rent (Tenant Pays)</div>
                      </TableCell>
                      <TableCell className="text-center space-y-1">
                        <div className="font-semibold text-calculator-info">
                          {scenarios.oneYear?.increases.length === 2 
                            ? `${formatCurrency(scenarios.oneYear.increases[0].newRent === inputs.preferentialRent ? inputs.preferentialRent! : (inputs.preferentialRent! * (1 + scenarios.oneYear.increases[0].percentIncrease / 100)))} / ${formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}`
                            : formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {scenarios.oneYear?.increases.length === 1 
                            ? `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} | +${formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay - inputs.preferentialRent)}`
                            : scenarios.oneYear?.increases.length === 2
                            ? (
                                <div className="space-y-1">
                                  <div>{formatPercent(scenarios.oneYear.increases[0].percentIncrease)} + {formatPercent(scenarios.oneYear.increases[1].percentIncrease)} | +{formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay - inputs.preferentialRent)}</div>
                                  <div className="text-xs italic">
                                    {scenarios.oneYear.increases[0].period} / {scenarios.oneYear.increases[1].period}
                                  </div>
                                </div>
                              )
                            : 'N/A'
                          }
                        </div>
                      </TableCell>
                      <TableCell className="text-center space-y-1">
                        <div className="font-semibold text-calculator-info">
                          {scenarios.twoYear?.preferentialResult && scenarios.twoYear.increases.length === 2
                            ? `${formatCurrency(scenarios.twoYear.preferentialResult.year1Amount || inputs.preferentialRent!)} / ${formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}`
                            : formatCurrency(scenarios.twoYear?.preferentialResult?.newTenantPay || inputs.preferentialRent!)
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {scenarios.twoYear?.increases.length === 1 
                            ? `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)} | +${formatCurrency((scenarios.twoYear.preferentialResult?.newTenantPay || 0) - (inputs.preferentialRent || 0))}`
                            : scenarios.twoYear?.increases.length === 2
                            ? (
                                <div className="space-y-1">
                                  <div>{formatPercent(scenarios.twoYear.increases[0].percentIncrease)} + {formatPercent(scenarios.twoYear.increases[1].percentIncrease)} | +{formatCurrency((scenarios.twoYear.preferentialResult?.newTenantPay || 0) - (inputs.preferentialRent || 0))}</div>
                                  <div className="text-xs italic">Year 1 / Year 2 amounts shown above</div>
                                </div>
                              )
                            : 'Split increase'
                          }
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Applied rule and breakdown */}
            <div className="mt-6 space-y-4">
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">Applied Rule: </span>
                <span className="font-medium">
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
                    
                    return `1-Year: ${oneYearPct} | 2-Year: ${twoYearPct}`;
                  })()}
                </span>
              </div>

              {/* Detailed breakdown for both 1-year and 2-year leases */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* 1-Year Lease Breakdown */}
                <div className="p-3 sm:p-4 bg-muted/20 rounded-lg">
                  <h4 className="font-semibold mb-2 sm:mb-3 text-sm text-calculator-success">1-Year Lease Details:</h4>
                  <div className="text-xs sm:text-sm space-y-2">
                    <div>
                      <p className="font-medium">Single Term Increase</p>
                      <p>{formatCurrency(inputs.currentRent)} → {formatCurrency(scenarios.oneYear?.newLegalRent || inputs.currentRent)}</p>
                      <p className="text-muted-foreground">
                        {scenarios.oneYear?.increases[0]?.percentIncrease !== undefined 
                          ? `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} increase (+${formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)})`
                          : 'No increase available'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2-Year Lease Breakdown */}
                <div className="p-3 sm:p-4 bg-muted/20 rounded-lg">
                  <h4 className="font-semibold mb-2 sm:mb-3 text-sm text-calculator-success">2-Year Lease Details:</h4>
                  <div className="text-xs sm:text-sm space-y-2">
                    {scenarios.twoYear && scenarios.twoYear.increases.length === 2 ? (
                      <>
                        <div>
                          <p className="font-medium">Year 1</p>
                          <p>{formatCurrency(inputs.currentRent)} → {formatCurrency(scenarios.twoYear.increases[0].newRent)}</p>
                          <p className="text-muted-foreground">
                            {formatPercent(scenarios.twoYear.increases[0].percentIncrease)} increase 
                            (+{formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)})
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Year 2</p>
                          <p>{formatCurrency(scenarios.twoYear.increases[0].newRent)} → {formatCurrency(scenarios.twoYear.increases[1].newRent)}</p>
                          <p className="text-muted-foreground">
                            {formatPercent(scenarios.twoYear.increases[1].percentIncrease)} increase 
                            (+{formatCurrency(scenarios.twoYear.increases[1].dollarIncrease)})
                          </p>
                        </div>
                      </>
                    ) : scenarios.twoYear ? (
                      <div>
                        <p className="font-medium">2-Year Term</p>
                        <p>{formatCurrency(inputs.currentRent)} → {formatCurrency(scenarios.twoYear.newLegalRent)}</p>
                        <p className="text-muted-foreground">
                          {formatPercent(scenarios.twoYear.increases[0]?.percentIncrease || 0)} total increase over 2 years
                          (+{formatCurrency(scenarios.twoYear.increases[0]?.dollarIncrease || 0)})
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">2-year option not available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Monthly Breakdown for Split Leases - Screen only */}
      {(result.oneYear.monthlyBreakdown || result.twoYear.monthlyBreakdown) && (
        <Card className="shadow-lg border-0 print:hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Monthly Payment Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Legal Rent</TableHead>
                    {inputs.preferentialRent && <TableHead>Tenant Pays</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(result.oneYear.monthlyBreakdown || result.twoYear.monthlyBreakdown)?.map((month) => (
                    <TableRow key={month.month}>
                      <TableCell className="font-medium">Month {month.month}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {month.period}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(month.legalRent)}</TableCell>
                      {inputs.preferentialRent && (
                        <TableCell className="font-semibold text-calculator-info">
                          {formatCurrency(month.tenantPay)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notice - Screen only */}
      <Card className="border-calculator-warning/50 bg-calculator-warning/5 print:hidden">
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