import React from 'react';
import { Copy, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalculationResult } from '../types/rgb';
import { formatCurrency, formatPercent } from '../utils/rentCalculator';
import { useToast } from '@/hooks/use-toast';

interface RentCalculatorResultsProps {
  result: CalculationResult;
  inputs: {
    leaseStartDate: Date;
    leaseTerm: 1 | 2;
    currentRent: number;
    preferentialRent?: number;
  };
}

export default function RentCalculatorResults({ result, inputs }: RentCalculatorResultsProps) {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    const summary = {
      leaseStart: inputs.leaseStartDate.toDateString(),
      leaseTerm: `${inputs.leaseTerm} year${inputs.leaseTerm > 1 ? 's' : ''}`,
      currentRent: formatCurrency(inputs.currentRent),
      newLegalRent: formatCurrency(result.newLegalRent),
      increases: result.increases,
      appliedRule: result.appliedRule,
      calculatedOn: new Date().toDateString()
    };

    const readableText = `
NYC Rent Stabilized Renewal Calculation

Lease Start: ${summary.leaseStart}
Lease Term: ${summary.leaseTerm}
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

      {/* Increase Breakdown */}
      <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Increase Breakdown</CardTitle>
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
              {inputs.leaseTerm === 2 ? ' (24 Months)' : ' (12 Months)'}
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