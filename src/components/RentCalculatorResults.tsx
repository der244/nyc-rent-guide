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
  result: CalculationResult;
  inputs: {
    leaseStartDate: Date;
    currentRent: number;
    preferentialRent?: number;
  };
}

export default function RentCalculatorResults({ result, inputs }: RentCalculatorResultsProps) {
  const { toast } = useToast();

  // Calculate both 1-year and 2-year scenarios for comparison
  const getBothScenarios = () => {
    const oneYearResult = calculateRentIncrease(inputs, 1);

    const twoYearResult = calculateRentIncrease(inputs, 2);

    // Get the guideline info from one of the results
    const oneYearGuideline = getGuideline(inputs.leaseStartDate, 1);
    
    return {
      oneYear: oneYearResult,
      twoYear: twoYearResult,
      effectivePeriod: oneYearGuideline ? `${oneYearGuideline.order.effective_from} to ${oneYearGuideline.order.effective_to}` : '',
      orderNumber: oneYearGuideline?.order.order || 0
    };
  };

  const scenarios = getBothScenarios();

  const copyToClipboard = async () => {
    const summary = {
      leaseStart: inputs.leaseStartDate.toDateString(),
      currentRent: formatCurrency(inputs.currentRent),
      newLegalRent: formatCurrency(result.newLegalRent),
      increases: result.increases,
      appliedRule: result.appliedRule,
      calculatedOn: new Date().toDateString()
    };

    const readableText = `
NYC Rent Stabilized Renewal Calculation

Lease Start: ${summary.leaseStart}
Current Legal Rent: ${summary.currentRent}
New Legal Rent: ${summary.newLegalRent}

${result.increases.map(inc => 
  `${inc.period}: ${formatCurrency(inc.oldRent)} → ${formatCurrency(inc.newRent)} (${formatPercent(inc.percentIncrease)} increase, +${formatCurrency(inc.dollarIncrease)})`
).join('\n')}

Applied Rule: ${summary.appliedRule}
Calculated on: ${summary.calculatedOn}

Disclaimer: For NYC rent-stabilized apartments only. Not legal advice. Confirm with HCR/RGB.
    `.trim();

    try {
      await navigator.clipboard.writeText(readableText);
      toast({
        title: "Results copied to clipboard",
        description: "The calculation results have been copied in a readable format.",
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
      {/* Summary Card */}
      <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
        <CardHeader className="bg-gradient-to-r from-calculator-success to-calculator-success/90 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Renewal Calculation Results
            </CardTitle>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Order #{result.order}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Legal Regulated Rent</p>
                <p className="text-2xl font-bold">{formatCurrency(inputs.currentRent)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Legal Regulated Rent</p>
                <p className="text-3xl font-bold text-calculator-success">{formatCurrency(result.newLegalRent)}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {inputs.preferentialRent && result.preferentialResult && (
                <div>
                  <p className="text-sm text-muted-foreground">Tenant Pays (Preferential)</p>
                  <p className="text-2xl font-bold text-calculator-info">{formatCurrency(result.preferentialResult.newTenantPay)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{result.preferentialResult.explanation}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground">Applied Rule</p>
                <p className="text-sm font-medium">{result.appliedRule}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={copyToClipboard} variant="outline" className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy Results
            </Button>
            <Button onClick={() => window.print()} variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Print
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Comparison Table */}
      {scenarios && (
        <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">
                RGB Order #{scenarios.orderNumber} - Complete Analysis
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
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
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold w-[140px]">Current Rent</TableHead>
                    <TableHead className="text-center font-semibold">1-Year Lease</TableHead>
                    <TableHead className="text-center font-semibold">2-Year Lease</TableHead>
                  </TableRow>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-muted-foreground text-sm">Starting Amount</TableHead>
                    <TableHead className="text-center text-muted-foreground text-sm">
                      New Amount | % Increase | $ Increase
                    </TableHead>
                    <TableHead className="text-center text-muted-foreground text-sm">
                      New Amount | % Increase | $ Increase
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Main rent calculation row */}
                  <TableRow className="border-b-2">
                    <TableCell className="font-bold text-lg">
                      {formatCurrency(inputs.currentRent)}
                    </TableCell>
                    <TableCell className="text-center space-y-1">
                      <div className="text-lg font-bold text-calculator-success">
                        {formatCurrency(scenarios.oneYear?.newLegalRent || inputs.currentRent)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {scenarios.oneYear?.increases[0]?.percentIncrease !== undefined 
                          ? `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} | +${formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)}`
                          : 'N/A'
                        }
                      </div>
                    </TableCell>
                    <TableCell className="text-center space-y-1">
                      <div className="text-lg font-bold text-calculator-success">
                        {formatCurrency(scenarios.twoYear?.newLegalRent || inputs.currentRent)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {scenarios.twoYear?.increases.length === 1 
                          ? `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)} | +${formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)}`
                          : scenarios.twoYear?.increases.length === 2
                          ? `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)}+${formatPercent(scenarios.twoYear.increases[1].percentIncrease)} | +${formatCurrency(scenarios.twoYear.increases.reduce((sum, inc) => sum + inc.dollarIncrease, 0))}`
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
                        <div className="text-xs text-muted-foreground">Preferential Rent</div>
                      </TableCell>
                      <TableCell className="text-center space-y-1">
                        <div className="font-semibold text-calculator-info">
                          {formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {scenarios.oneYear?.increases[0]?.percentIncrease !== undefined 
                            ? `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} | +${formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay - inputs.preferentialRent)}`
                            : 'N/A'
                          }
                        </div>
                      </TableCell>
                      <TableCell className="text-center space-y-1">
                        <div className="font-semibold text-calculator-info">
                          {formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {scenarios.twoYear?.increases.length === 1 
                            ? `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)} | +${formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay - inputs.preferentialRent)}`
                            : scenarios.twoYear?.increases.length === 2
                            ? `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)}+${formatPercent(scenarios.twoYear.increases[1].percentIncrease)} | +${formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay - inputs.preferentialRent)}`
                            : 'Split increase'
                          }
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Detailed breakdown for 2-year leases */}
            {scenarios.twoYear && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-3 text-sm">2-Year Lease Yearly Breakdown:</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {scenarios.twoYear.increases.length === 2 ? (
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
                  ) : (
                    <div className="md:col-span-2">
                      <p className="font-medium">2-Year Term</p>
                      <p>{formatCurrency(inputs.currentRent)} → {formatCurrency(scenarios.twoYear.newLegalRent)}</p>
                      <p className="text-muted-foreground">
                        {formatPercent(scenarios.twoYear.increases[0].percentIncrease)} total increase over 2 years
                        (+{formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)})
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Original Increase Breakdown */}
      <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
        <CardHeader>
            <CardTitle className="text-lg font-semibold">Detailed Increase Breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">
              Step-by-step calculation breakdown
            </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Previous Rent</TableHead>
                <TableHead>New Rent</TableHead>
                <TableHead>% Increase</TableHead>
                <TableHead>$ Increase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.increases.map((increase, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{increase.period}</TableCell>
                  <TableCell>{formatCurrency(increase.oldRent)}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(increase.newRent)}</TableCell>
                  <TableCell>
                    <Badge variant={increase.percentIncrease > 0 ? "secondary" : "outline"}>
                      {formatPercent(increase.percentIncrease)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {increase.dollarIncrease > 0 ? '+' : ''}{formatCurrency(increase.dollarIncrease)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Monthly Breakdown for Split Leases */}
      {result.monthlyBreakdown && (
        <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
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
                  {result.monthlyBreakdown.map((month) => (
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

      {/* Important Notice */}
      <Card className="border-calculator-warning/50 bg-calculator-warning/5">
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