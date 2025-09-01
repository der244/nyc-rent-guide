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
                <p className="text-sm">
                  {scenarios.oneYear?.increases.length === 1 
                    ? `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} increase (+${formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)})`
                    : scenarios.oneYear?.increases.length === 2
                    ? `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} + ${formatPercent(scenarios.oneYear.increases[1].percentIncrease)} | +${formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)} / +${formatCurrency(scenarios.oneYear.increases[1].dollarIncrease)}`
                    : 'N/A'
                  }
                </p>
              </div>
            )}
          </div>

          <div className="border border-gray-300 p-4">
            <h3 className="font-bold text-lg mb-3">2-Year Lease Option</h3>
            {scenarios.twoYear?.increases.length === 2 ? (
              <p className="text-xl font-bold text-green-700 mb-2">
                {formatCurrency(scenarios.twoYear.increases[0].newRent)} / {formatCurrency(scenarios.twoYear.increases[1].newRent)}
              </p>
            ) : (
              <p className="text-xl font-bold text-green-700 mb-2">{formatCurrency(scenarios.twoYear?.newLegalRent || inputs.currentRent)}</p>
            )}
            <p className="text-sm">
              {scenarios.twoYear?.increases.length === 1 
                ? `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)} increase (+${formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)})`
                : scenarios.twoYear?.increases.length === 2
                ? `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)} + ${formatPercent(scenarios.twoYear.increases[1].percentIncrease)} | +${formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)} / +${formatCurrency(scenarios.twoYear.increases[1].dollarIncrease)}`
                : 'Split increase over 2 years'
              }
            </p>
            {scenarios.twoYear?.increases.length === 2 && (
              <p className="text-xs text-gray-600 mt-1">Year 1 / Year 2 amounts shown above</p>
            )}
            {inputs.preferentialRent && scenarios.twoYear?.preferentialResult && (
              <div className="mt-3 pt-2 border-t border-gray-200">
                <p className="text-sm font-medium">Tenant Pays (Preferential):</p>
                {scenarios.twoYear?.increases.length === 2 ? (
                  <>
                    <p className="text-lg font-bold text-blue-700">
                      {formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay - (scenarios.twoYear.increases[1].newRent - scenarios.twoYear.increases[0].newRent))} / {formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}
                    </p>
                    <p className="text-sm">
                      {formatPercent(scenarios.twoYear.increases[0].percentIncrease)} + {formatPercent(scenarios.twoYear.increases[1].percentIncrease)} | +{formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)} / +{formatCurrency(scenarios.twoYear.increases[1].dollarIncrease)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Year 1 / Year 2 amounts shown above</p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-blue-700">{formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}</p>
                )}
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

      {/* Screen-only responsive view */}
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
          
          <CardContent className="p-4 sm:p-6">
            {/* Mobile Card Layout */}
            <div className="block lg:hidden space-y-4">
              {/* Current Rent Card */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Current Rent</h3>
                  <div className="space-y-1">
                    <p className="text-xl font-bold">{formatCurrency(inputs.currentRent)}</p>
                    <p className="text-sm text-muted-foreground">Legal Regulated Rent</p>
                    {inputs.preferentialRent && (
                      <>
                        <p className="text-lg font-semibold text-primary">{formatCurrency(inputs.preferentialRent)}</p>
                        <p className="text-sm text-muted-foreground">Tenant Currently Pays</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 1-Year Lease Card */}
              <Card className="bg-calculator-success/5 border-calculator-success/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-calculator-success">1-Year Lease</h3>
                    <Button
                      onClick={() => copyLeaseAmount(scenarios.oneYear?.newLegalRent || inputs.currentRent, "1-Year")}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold text-calculator-success">{formatCurrency(scenarios.oneYear?.newLegalRent || inputs.currentRent)}</p>
                      <p className="text-sm text-muted-foreground">Legal Rent</p>
                      {scenarios.oneYear?.increases && (
                        <div className="mt-2 text-sm">
                          {scenarios.oneYear.increases.length === 1 ? (
                            <div className="space-y-1">
                              <p className="font-medium">{formatPercent(scenarios.oneYear.increases[0].percentIncrease)} increase</p>
                              <p className="text-muted-foreground">+{formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)}</p>
                            </div>
                          ) : scenarios.oneYear.increases.length === 2 ? (
                            <div className="space-y-1">
                              <p className="font-medium">{formatPercent(scenarios.oneYear.increases[0].percentIncrease)} + {formatPercent(scenarios.oneYear.increases[1].percentIncrease)}</p>
                              <p className="text-muted-foreground">+{formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)} + {formatCurrency(scenarios.oneYear.increases[1].dollarIncrease)}</p>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                    {inputs.preferentialRent && scenarios.oneYear?.preferentialResult && (
                      <div className="pt-3 border-t border-calculator-success/20">
                        <p className="text-lg font-semibold text-primary">{formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}</p>
                        <p className="text-sm text-muted-foreground">Tenant Pays (Preferential)</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 2-Year Lease Card */}
              <Card className="bg-calculator-info/5 border-calculator-info/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-calculator-info">2-Year Lease</h3>
                    <Button
                      onClick={() => copyLeaseAmount(scenarios.twoYear?.newLegalRent || inputs.currentRent, "2-Year")}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      {scenarios.twoYear?.increases.length === 2 ? (
                        <div className="space-y-2">
                          <div>
                            <p className="text-lg font-bold text-calculator-info">{formatCurrency(scenarios.twoYear.increases[0].newRent)}</p>
                            <p className="text-sm text-muted-foreground">Year 1 Legal Rent</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-calculator-info">{formatCurrency(scenarios.twoYear.increases[1].newRent)}</p>
                            <p className="text-sm text-muted-foreground">Year 2 Legal Rent</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-2xl font-bold text-calculator-info">{formatCurrency(scenarios.twoYear?.newLegalRent || inputs.currentRent)}</p>
                          <p className="text-sm text-muted-foreground">Legal Rent</p>
                        </div>
                      )}
                      {scenarios.twoYear?.increases && (
                        <div className="mt-2 text-sm">
                          {scenarios.twoYear.increases.length === 1 ? (
                            <div className="space-y-1">
                              <p className="font-medium">{formatPercent(scenarios.twoYear.increases[0].percentIncrease)} increase</p>
                              <p className="text-muted-foreground">+{formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)}</p>
                            </div>
                          ) : scenarios.twoYear.increases.length === 2 ? (
                            <div className="space-y-1">
                              <p className="font-medium">{formatPercent(scenarios.twoYear.increases[0].percentIncrease)} + {formatPercent(scenarios.twoYear.increases[1].percentIncrease)}</p>
                              <p className="text-muted-foreground">+{formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)} / +{formatCurrency(scenarios.twoYear.increases[1].dollarIncrease)}</p>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                    {inputs.preferentialRent && scenarios.twoYear?.preferentialResult && (
                      <div className="pt-3 border-t border-calculator-info/20">
                        {scenarios.twoYear?.increases.length === 2 ? (
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-semibold text-primary">{formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay - (scenarios.twoYear.increases[1].newRent - scenarios.twoYear.increases[0].newRent))}</p>
                              <p className="text-xs text-muted-foreground">Year 1 Tenant Pays</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-primary">{formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}</p>
                              <p className="text-xs text-muted-foreground">Year 2 Tenant Pays</p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-lg font-semibold text-primary">{formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}</p>
                            <p className="text-sm text-muted-foreground">Tenant Pays (Preferential)</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-sm">Current Rent</TableHead>
                    <TableHead className="text-center font-semibold text-sm">1-Year Lease</TableHead>
                    <TableHead className="text-center font-semibold text-sm">2-Year Lease</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="space-y-2">
                        <p className="text-xl font-bold">{formatCurrency(inputs.currentRent)}</p>
                        <p className="text-sm text-muted-foreground">Legal Regulated Rent</p>
                        {inputs.preferentialRent && (
                          <div className="pt-2 border-t border-muted">
                            <p className="text-lg font-semibold text-primary">{formatCurrency(inputs.preferentialRent)}</p>
                            <p className="text-sm text-muted-foreground">Tenant Currently Pays</p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xl font-bold text-calculator-success">{formatCurrency(scenarios.oneYear?.newLegalRent || inputs.currentRent)}</span>
                          <Button
                            onClick={() => copyLeaseAmount(scenarios.oneYear?.newLegalRent || inputs.currentRent, "1-Year")}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">Legal Rent</p>
                        {scenarios.oneYear?.increases && (
                          <div className="text-sm space-y-1">
                            {scenarios.oneYear.increases.length === 1 ? (
                              <>
                                <p className="font-medium">{formatPercent(scenarios.oneYear.increases[0].percentIncrease)}</p>
                                <p className="text-muted-foreground">+{formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)}</p>
                              </>
                            ) : scenarios.oneYear.increases.length === 2 ? (
                              <>
                                <p className="font-medium">{formatPercent(scenarios.oneYear.increases[0].percentIncrease)} + {formatPercent(scenarios.oneYear.increases[1].percentIncrease)}</p>
                                <p className="text-muted-foreground">+{formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)} + {formatCurrency(scenarios.oneYear.increases[1].dollarIncrease)}</p>
                              </>
                            ) : null}
                          </div>
                        )}
                        {inputs.preferentialRent && scenarios.oneYear?.preferentialResult && (
                          <div className="pt-2 border-t border-muted space-y-1">
                            <p className="text-lg font-semibold text-primary">{formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}</p>
                            <p className="text-sm text-muted-foreground">Tenant Pays</p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          {scenarios.twoYear?.increases.length === 2 ? (
                            <div className="space-y-1 text-center">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-calculator-info">{formatCurrency(scenarios.twoYear.increases[0].newRent)}</span>
                                <span className="text-sm text-muted-foreground">/</span>
                                <span className="text-xl font-bold text-calculator-info">{formatCurrency(scenarios.twoYear.increases[1].newRent)}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">Year 1 / Year 2</p>
                            </div>
                          ) : (
                            <span className="text-xl font-bold text-calculator-info">{formatCurrency(scenarios.twoYear?.newLegalRent || inputs.currentRent)}</span>
                          )}
                          <Button
                            onClick={() => copyLeaseAmount(scenarios.twoYear?.newLegalRent || inputs.currentRent, "2-Year")}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">Legal Rent</p>
                        {scenarios.twoYear?.increases && (
                          <div className="text-sm space-y-1">
                            {scenarios.twoYear.increases.length === 1 ? (
                              <>
                                <p className="font-medium">{formatPercent(scenarios.twoYear.increases[0].percentIncrease)}</p>
                                <p className="text-muted-foreground">+{formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)}</p>
                              </>
                            ) : scenarios.twoYear.increases.length === 2 ? (
                              <>
                                <p className="font-medium">{formatPercent(scenarios.twoYear.increases[0].percentIncrease)} + {formatPercent(scenarios.twoYear.increases[1].percentIncrease)}</p>
                                <p className="text-muted-foreground">+{formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)} / +{formatCurrency(scenarios.twoYear.increases[1].dollarIncrease)}</p>
                              </>
                            ) : null}
                          </div>
                        )}
                        {inputs.preferentialRent && scenarios.twoYear?.preferentialResult && (
                          <div className="pt-2 border-t border-muted space-y-1">
                            {scenarios.twoYear?.increases.length === 2 ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 justify-center">
                                  <span className="text-base font-semibold text-primary">{formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay - (scenarios.twoYear.increases[1].newRent - scenarios.twoYear.increases[0].newRent))}</span>
                                  <span className="text-sm text-muted-foreground">/</span>
                                  <span className="text-lg font-semibold text-primary">{formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Year 1 / Year 2 Tenant Pays</p>
                              </div>
                            ) : (
                              <>
                                <p className="text-lg font-semibold text-primary">{formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}</p>
                                <p className="text-sm text-muted-foreground">Tenant Pays</p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applied rule and breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 print:hidden">
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
              Applied Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            {(() => {
              const oneYearGuideline = getGuideline(inputs.leaseStartDate, 1);
              const twoYearGuideline = getGuideline(inputs.leaseStartDate, 2);
              
              const oneYearPct = oneYearGuideline?.rule.type === 'flat' ? 
                `${oneYearGuideline.rule.pct}%` :
                oneYearGuideline?.rule.type === 'split' ?
                `Year 1: ${oneYearGuideline.rule.year1_pct}% | Year 2: ${oneYearGuideline.rule.year2_pct_on_year1_rent}%` :
                oneYearGuideline?.rule.type === 'split_by_month' ?
                `First Month: ${oneYearGuideline.rule.first_pct}% | Remaining: ${oneYearGuideline.rule.remaining_months_pct}%` :
                'N/A';
              
              const twoYearPct = twoYearGuideline?.rule.type === 'flat' ? 
                `${twoYearGuideline.rule.pct}%` :
                twoYearGuideline?.rule.type === 'split' ?
                `Year 1: ${twoYearGuideline.rule.year1_pct}% | Year 2: ${twoYearGuideline.rule.year2_pct_on_year1_rent}%` :
                twoYearGuideline?.rule.type === 'split_by_month' ?
                `First Month: ${twoYearGuideline.rule.first_pct}% | Remaining: ${twoYearGuideline.rule.remaining_months_pct}%` :
                'N/A';
              
              return (
                <>
                  <div className="space-y-2">
                    <div>
                      <Badge variant="outline" className="bg-calculator-success/10 text-calculator-success border-calculator-success/30 mb-2">
                        1-Year Lease
                      </Badge>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{oneYearPct}</p>
                    </div>
                    <div>
                      <Badge variant="outline" className="bg-calculator-info/10 text-calculator-info border-calculator-info/30 mb-2">
                        2-Year Lease
                      </Badge>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{twoYearPct}</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs sm:text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              <strong className="text-foreground">Legal vs. Preferential Rent:</strong> If you pay less than the legal regulated rent (preferential rent), your landlord can increase your preferential rent up to the legal rent limit or apply the guideline increase, whichever is lower.
            </p>
            <p>
              <strong className="text-foreground">Additional Increases:</strong> This calculation does not include vacancy allowances, Major Capital Improvements (MCI), Individual Apartment Improvements (IAI), or other permitted adjustments.
            </p>
            <p>
              <strong className="text-foreground">Verification Required:</strong> Always confirm calculations with NYC Housing and Community Renewal (HCR) or the Rent Guidelines Board (RGB) for official verification.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Links section */}
      <Card className="border-dashed border-2 border-muted-foreground/30 print:hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Official NYC Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            <a
              href="https://rentguidelinesboard.cityofnewyork.us/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/20 hover:border-primary/30"
            >
              <span className="text-primary font-medium">RGB Official Site</span>
            </a>
            <a
              href="https://portal.hcr.ny.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/20 hover:border-primary/30"
            >
              <span className="text-primary font-medium">HCR Portal</span>
            </a>
            <a
              href="https://www1.nyc.gov/site/rentguidelinesboard/resources/rent-stabilized-lease-renewal.page"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/20 hover:border-primary/30"
            >
              <span className="text-primary font-medium">Lease Renewal Guide</span>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="bg-destructive/5 border-destructive/30 print:hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="font-semibold text-destructive">Important Disclaimer</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This calculator is for informational purposes only and is not legal advice. Rent stabilization laws are complex and subject to change. 
                Always consult with the NYC Housing and Community Renewal (HCR), Rent Guidelines Board (RGB), or a qualified attorney for official calculations and legal guidance. 
                This tool does not account for all possible rent adjustments, exemptions, or special circumstances that may apply to your specific situation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
