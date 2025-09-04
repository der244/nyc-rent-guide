import React from 'react';
import { Copy, FileText, CheckCircle, AlertCircle, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalculationResult } from '../types/rgb';
import { formatCurrency, formatPercent, getGuideline, calculateRentIncrease } from '../utils/rentCalculator';
import { useToast } from '@/hooks/use-toast';
import MobileRentResults from './MobileRentResults';
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
    tenantName?: string;
  };
}
export default function RentCalculatorResults({
  result,
  inputs
}: RentCalculatorResultsProps) {
  const {
    toast
  } = useToast();

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
${inputs.tenantName ? `\nTENANT: ${inputs.tenantName}` : ''}${inputs.address ? `\nPROPERTY: ${inputs.address}` : ''}${inputs.unit ? `\nUNIT: ${inputs.unit}` : ''}

CURRENT RENT: ${formatCurrency(inputs.currentRent)}${inputs.preferentialRent ? ` (Tenant Pays: ${formatCurrency(inputs.preferentialRent)})` : ''}
LEASE START: ${inputs.leaseStartDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })}

1-YEAR LEASE:
• Legal Rent: ${getOneYearDetails()}${inputs.preferentialRent && scenarios.oneYear?.preferentialResult ? `\n• Tenant Pays: ${formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}` : ''}

2-YEAR LEASE:
• Legal Rent: ${getTwoYearDetails()}${inputs.preferentialRent && scenarios.twoYear?.preferentialResult ? `\n• Tenant Pays: ${formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}` : ''}

APPLIED RATES:
• 1-Year: ${oneYearGuideline?.rule.type === 'flat' ? `${oneYearGuideline.rule.pct}%` : oneYearGuideline?.rule.type === 'split' ? `${oneYearGuideline.rule.year1_pct}% / ${oneYearGuideline.rule.year2_pct_on_year1_rent}%` : oneYearGuideline?.rule.type === 'split_by_month' ? `${oneYearGuideline.rule.first_pct}% / ${oneYearGuideline.rule.remaining_months_pct}%` : 'N/A'}
• 2-Year: ${twoYearGuideline?.rule.type === 'flat' ? `${twoYearGuideline.rule.pct}%` : twoYearGuideline?.rule.type === 'split' ? `${twoYearGuideline.rule.year1_pct}% / ${twoYearGuideline.rule.year2_pct_on_year1_rent}%` : twoYearGuideline?.rule.type === 'split_by_month' ? `${twoYearGuideline.rule.first_pct}% / ${twoYearGuideline.rule.remaining_months_pct}%` : 'N/A'}

Calculated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })}
NYC rent-stabilized apartments only. Not legal advice. Confirm with HCR/RGB.`;
    try {
      await navigator.clipboard.writeText(readableText);
      toast({
        title: "Results copied to clipboard",
        description: "Clear calculation summary with all lease options and rates copied."
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive"
      });
    }
  };
  const copyLeaseAmount = async (amount: number | string, leaseType: string) => {
    try {
      const textToCopy = typeof amount === 'number' ? formatCurrency(amount) : amount.toString();
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Amount copied",
        description: `${leaseType} ${typeof amount === 'number' ? formatCurrency(amount) : amount} copied to clipboard`
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive"
      });
    }
  };
  return <div className="space-y-6">
      {/* Print-only simplified view */}
      <div className="print-only hidden print:block print:space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">NYC Rent Stabilized Renewal Calculation</h1>
          <h2 className="text-lg text-gray-700">RGB Order #{scenarios.orderNumber}</h2>
          {inputs.tenantName && <p className="text-sm font-medium mt-2">
              <strong>Tenant:</strong> {inputs.tenantName}
            </p>}
          {inputs.address && <p className="text-sm font-medium mt-2">
              <strong>Property:</strong> {inputs.address}
            </p>}
          {inputs.unit && <p className="text-sm font-medium">
              <strong>Unit:</strong> {inputs.unit}
            </p>}
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
            {inputs.preferentialRent ? `${formatCurrency(inputs.currentRent)} / ${formatCurrency(inputs.preferentialRent)}` : formatCurrency(inputs.currentRent)}
          </p>
          <p className="text-sm mb-2">
            {inputs.preferentialRent ? "Legal / Preferential Rent (Tenant Currently Pays)" : "Legal Regulated Rent"}
          </p>
        </div>

        <div className="border border-gray-300 p-4 mb-4">
          <h3 className="font-bold text-lg mb-3">Lease End Dates</h3>
          <div className="space-y-2">
            <p className="text-base">
              <strong>1-year end date - </strong>{new Date(inputs.leaseStartDate.getFullYear() + 1, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
            </p>
            <p className="text-base">
              <strong>2-year end date - </strong>{new Date(inputs.leaseStartDate.getFullYear() + 2, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
            </p>
          </div>
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
                <div className="text-2xl font-bold text-calculator-success">
                  {scenarios.oneYear?.increases.length === 2 ? `${formatCurrency(scenarios.oneYear.increases[0].newRent)} / ${formatCurrency(scenarios.oneYear.increases[1].newRent)}` : formatCurrency(scenarios.oneYear?.newLegalRent || inputs.currentRent)}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {scenarios.oneYear?.increases.length === 2 ? `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} / ${formatPercent(scenarios.oneYear.increases[1].percentIncrease)} | ${formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)} / ${formatCurrency(scenarios.oneYear.increases[1].dollarIncrease)}` : `${formatPercent(scenarios.oneYear?.increases[0]?.percentIncrease || 0)} | ${formatCurrency(scenarios.oneYear?.increases[0]?.dollarIncrease || 0)}`}
                </div>
              </td>
              <td className="text-center p-4">
                <div className="text-2xl font-bold text-calculator-success">
                  {scenarios.twoYear?.increases.length === 2 ? `${formatCurrency(scenarios.twoYear.increases[0].newRent)} / ${formatCurrency(scenarios.twoYear.increases[1].newRent)}` : formatCurrency(scenarios.twoYear?.newLegalRent || inputs.currentRent)}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {scenarios.twoYear?.increases.length === 2 ? `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)} / ${formatPercent(scenarios.twoYear.increases[1].percentIncrease)} | ${formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)} / ${formatCurrency(scenarios.twoYear.increases[1].dollarIncrease)}` : `${formatPercent(scenarios.twoYear?.increases[0]?.percentIncrease || 0)} | ${formatCurrency(scenarios.twoYear?.increases[0]?.dollarIncrease || 0)}`}
                </div>
              </td>
            </tr>
            
            {/* Preferential Rent Row (if applicable) */}
            {inputs.preferentialRent && <tr className="border-b border-gray-300">
                <td className="p-4">
                  <div className="text-xl font-bold">{formatCurrency(inputs.preferentialRent)}</div>
                  <div className="text-sm text-gray-600">Tenant Currently Pays (Preferential)</div>
                </td>
                <td className="text-center p-4">
                  {scenarios.oneYear?.preferentialResult && <>
                      <div className="text-2xl font-bold text-secondary-foreground">
                        {scenarios.oneYear.increases.length === 2 && scenarios.oneYear.preferentialResult.year1Amount ? `${formatCurrency(scenarios.oneYear.preferentialResult.year1Amount)} / ${formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}` : formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {scenarios.oneYear.increases.length === 2 && scenarios.oneYear.preferentialResult.year1Amount ? `${formatPercent(scenarios.oneYear.increases[0].percentIncrease)} / ${formatPercent(scenarios.oneYear.increases[1].percentIncrease)} | ${formatCurrency(inputs.preferentialRent! * scenarios.oneYear.increases[0].percentIncrease / 100)} / ${formatCurrency((scenarios.oneYear.preferentialResult.year1Amount || inputs.preferentialRent!) * scenarios.oneYear.increases[1].percentIncrease / 100)}` : `${formatPercent(scenarios.oneYear?.increases[0]?.percentIncrease || 0)} | ${formatCurrency((scenarios.oneYear.preferentialResult?.newTenantPay || 0) - (inputs.preferentialRent || 0))}`}
                      </div>
                    </>}
                </td>
                <td className="text-center p-4">
                  {scenarios.twoYear?.preferentialResult && <>
                      <div className="text-2xl font-bold text-secondary-foreground">
                        {scenarios.twoYear.increases.length === 2 && scenarios.twoYear.preferentialResult.year1Amount ? `${formatCurrency(scenarios.twoYear.preferentialResult.year1Amount)} / ${formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}` : formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {scenarios.twoYear.increases.length === 2 && scenarios.twoYear.preferentialResult.year1Amount ? `${formatPercent(scenarios.twoYear.increases[0].percentIncrease)} / ${formatPercent(scenarios.twoYear.increases[1].percentIncrease)} | ${formatCurrency(inputs.preferentialRent! * scenarios.twoYear.increases[0].percentIncrease / 100)} / ${formatCurrency((scenarios.twoYear.preferentialResult.year1Amount || inputs.preferentialRent!) * scenarios.twoYear.increases[1].percentIncrease / 100)}` : `${formatPercent(scenarios.twoYear?.increases[0]?.percentIncrease || 0)} | ${formatCurrency((scenarios.twoYear.preferentialResult?.newTenantPay || 0) - (inputs.preferentialRent || 0))}`}
                      </div>
                    </>}
                </td>
              </tr>}
          </tbody>
        </table>
      </div>

      {/* Mobile Layout */}
      <MobileRentResults result={result} inputs={inputs} onCopyAmount={copyLeaseAmount} />

      {/* Desktop/Tablet Table Layout */}
      {scenarios && <Card className="shadow-lg border border-border print:hidden hidden md:block" style={{
      boxShadow: 'var(--shadow-elevated)'
    }}>
          <CardHeader className="bg-gradient-to-r from-calculator-header to-calculator-header/90 text-white rounded-t-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  RGB Order #{scenarios.orderNumber} - Renewal Calculation
                </CardTitle>
                {(inputs.tenantName || inputs.address || inputs.unit) && <div className="mt-2 text-sm text-white/90 space-y-1">
                    {inputs.tenantName && <div>👤 {inputs.tenantName}</div>}
                    {inputs.address && <div>📍 {inputs.address}</div>}
                    {inputs.unit && <div>🏠 Unit {inputs.unit}</div>}
                  </div>}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button onClick={copyToClipboard} variant="outline" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm">
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Copy Results
                </Button>
                <Button onClick={() => {
              // Set document title for meaningful filename
              const currentTitle = document.title;
              const date = new Date().toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              }).replace(/\//g, '-');
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
            <div className="w-full">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="bg-primary text-primary-foreground border-b-2 border-primary">
                    <TableHead className="font-bold w-[25%] text-sm md:text-base text-primary-foreground">Current Rent</TableHead>
                    <TableHead className="text-center font-bold text-sm md:text-base w-[37.5%] text-primary-foreground">1-Year Lease</TableHead>
                    <TableHead className="text-center font-bold text-sm md:text-base w-[37.5%] text-primary-foreground">2-Year Lease</TableHead>
                  </TableRow>
                  
                  <TableRow className="bg-secondary border-b border-border">
                    <TableHead className="text-foreground text-sm md:text-base py-4 font-semibold">Lease End Date</TableHead>
                    <TableHead className="text-center text-foreground text-sm md:text-base px-1 py-4 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <div>
                          {new Date(inputs.leaseStartDate.getFullYear() + 1, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric"
                      })}
                        </div>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(new Date(inputs.leaseStartDate.getFullYear() + 1, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric"
                    }), '1-year lease end date')} title="Copy lease end date">
                          <Copy className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center text-foreground text-sm md:text-base px-1 py-4 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <div>
                          {new Date(inputs.leaseStartDate.getFullYear() + 2, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric"
                      })}
                        </div>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(new Date(inputs.leaseStartDate.getFullYear() + 2, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric"
                    }), '2-year lease end date')} title="Copy lease end date">
                          <Copy className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Main rent calculation row */}
                  <TableRow className="border-b-2 border-primary/20 bg-calculator-success/5">
                    <TableCell className="font-bold text-base sm:text-lg">
        <div className="flex items-center justify-center gap-2">
          <div className="text-primary text-xl font-bold">{formatCurrency(inputs.currentRent)}</div>
          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(inputs.currentRent, 'current legal rent')} title="Copy current legal rent">
            <Copy className="h-2 w-2" />
          </Button>
        </div>
                      <div className="text-xs md:text-sm text-calculator-header font-semibold text-center">Legal Regulated Rent</div>
                    </TableCell>
                    <TableCell className="text-center space-y-1 px-2 sm:px-4">
                      <div className="flex flex-col items-center justify-center gap-1">
                        {scenarios.oneYear?.increases.length === 2 ? <div className="flex items-center justify-center gap-2 relative">
            <div className="flex items-center justify-center gap-2">
              <div className="text-sm sm:text-lg font-bold text-primary">
                {formatCurrency(scenarios.oneYear.increases[0].newRent)}
              </div>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(scenarios.oneYear.increases[0].newRent, '1-year year 1')} title="Copy Year 1 amount">
                <Copy className="h-2 w-2" />
              </Button>
            </div>
            <div className="text-sm sm:text-lg font-bold text-primary">/</div>
            <div className="flex items-center justify-center gap-2">
              <div className="text-sm sm:text-lg font-bold text-primary">
                {formatCurrency(scenarios.oneYear.newLegalRent)}
              </div>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(scenarios.oneYear.newLegalRent, '1-year final')} title="Copy final amount">
                <Copy className="h-2 w-2" />
              </Button>
            </div>
                          </div> : <div className="flex items-center justify-center gap-2">
                            <div className="text-sm sm:text-lg font-bold text-primary break-words">
                              {formatCurrency(scenarios.oneYear?.newLegalRent || inputs.currentRent)}
                            </div>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(scenarios.oneYear?.newLegalRent || inputs.currentRent, '1-year')} title="Copy amount">
                              <Copy className="h-2 w-2" />
                            </Button>
                          </div>}
                      </div>
                      <div className="text-sm md:text-base text-muted-foreground leading-tight whitespace-nowrap">
                        {scenarios.oneYear?.increases.length === 1 
                          ? (
                            <span className="inline-flex items-center gap-1">
                              {formatPercent(scenarios.oneYear.increases[0].percentIncrease)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                onClick={() => copyLeaseAmount(`${scenarios.oneYear.increases[0].percentIncrease}%`, '1-year percentage increase')}
                                title="Copy percentage increase"
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                              | {formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                onClick={() => copyLeaseAmount(scenarios.oneYear.increases[0].dollarIncrease, '1-year dollar increase')}
                                title="Copy dollar increase"
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                            </span>
                          )
                          : scenarios.oneYear?.increases.length === 2 
                          ? (
                            <span className="inline-flex items-center gap-1">
                              {formatPercent(scenarios.oneYear.increases[0].percentIncrease)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                onClick={() => copyLeaseAmount(`${scenarios.oneYear.increases[0].percentIncrease}%`, '1-year year 1 percentage increase')}
                                title="Copy year 1 percentage increase"
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                              / {formatPercent(scenarios.oneYear.increases[1].percentIncrease)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                onClick={() => copyLeaseAmount(`${scenarios.oneYear.increases[1].percentIncrease}%`, '1-year year 2 percentage increase')}
                                title="Copy year 2 percentage increase"
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                              | {formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                onClick={() => copyLeaseAmount(scenarios.oneYear.increases[0].dollarIncrease, '1-year year 1 dollar increase')}
                                title="Copy year 1 dollar increase"
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                              / {formatCurrency(scenarios.oneYear.increases[1].dollarIncrease)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                onClick={() => copyLeaseAmount(scenarios.oneYear.increases[1].dollarIncrease, '1-year year 2 dollar increase')}
                                title="Copy year 2 dollar increase"
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                            </span>
                          )
                          : 'N/A'
                        }
                      </div>
                      {scenarios.oneYear?.increases.length === 2 && <div className="text-xs md:text-sm text-muted-foreground italic">
                          {scenarios.oneYear.increases[0].period} / {scenarios.oneYear.increases[1].period}
                        </div>}
                    </TableCell>
                    <TableCell className="text-center space-y-1 px-2 sm:px-4">
                      <div className="flex flex-col items-center justify-center gap-1">
                        {scenarios.twoYear?.increases.length === 2 ? <div className="flex items-center justify-center gap-2 relative">
            <div className="flex items-center justify-center gap-2">
              <div className="text-sm sm:text-lg font-bold text-primary">
                {formatCurrency(scenarios.twoYear.increases[0].newRent)}
              </div>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(scenarios.twoYear.increases[0].newRent, '2-year year 1')} title="Copy Year 1 amount">
                <Copy className="h-2 w-2" />
              </Button>
            </div>
                            <div className="text-sm sm:text-lg font-bold text-primary">/</div>
            <div className="flex items-center justify-center gap-2">
              <div className="text-sm sm:text-lg font-bold text-primary">
                {formatCurrency(scenarios.twoYear.newLegalRent)}
              </div>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(scenarios.twoYear.newLegalRent, '2-year final')} title="Copy final amount">
                <Copy className="h-2 w-2" />
              </Button>
            </div>
                          </div> : <div className="flex items-center justify-center gap-2">
                            <div className="text-sm sm:text-lg font-bold text-primary break-words">
                              {formatCurrency(scenarios.twoYear?.newLegalRent || inputs.currentRent)}
                            </div>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(scenarios.twoYear?.newLegalRent || inputs.currentRent, '2-year')} title="Copy amount">
                              <Copy className="h-2 w-2" />
                            </Button>
                          </div>}
                      </div>
                      <div className="text-sm md:text-base text-muted-foreground leading-tight whitespace-nowrap">
                        {scenarios.twoYear?.increases.length === 1 
                          ? (
                            <span className="inline-flex items-center gap-1">
                              {formatPercent(scenarios.twoYear.increases[0].percentIncrease)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                onClick={() => copyLeaseAmount(`${scenarios.twoYear.increases[0].percentIncrease}%`, '2-year percentage increase')}
                                title="Copy percentage increase"
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                              | {formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                onClick={() => copyLeaseAmount(scenarios.twoYear.increases[0].dollarIncrease, '2-year dollar increase')}
                                title="Copy dollar increase"
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                            </span>
                          )
                          : scenarios.twoYear?.increases.length === 2 
                          ? (
                            <span className="inline-flex items-center gap-1">
                              {formatPercent(scenarios.twoYear.increases[0].percentIncrease)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                onClick={() => copyLeaseAmount(`${scenarios.twoYear.increases[0].percentIncrease}%`, '2-year year 1 percentage increase')}
                                title="Copy year 1 percentage increase"
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                              / {formatPercent(scenarios.twoYear.increases[1].percentIncrease)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                onClick={() => copyLeaseAmount(`${scenarios.twoYear.increases[1].percentIncrease}%`, '2-year year 2 percentage increase')}
                                title="Copy year 2 percentage increase"
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                              | {formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                onClick={() => copyLeaseAmount(scenarios.twoYear.increases[0].dollarIncrease, '2-year year 1 dollar increase')}
                                title="Copy year 1 dollar increase"
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                              / {formatCurrency(scenarios.twoYear.increases[1].dollarIncrease)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                onClick={() => copyLeaseAmount(scenarios.twoYear.increases[1].dollarIncrease, '2-year year 2 dollar increase')}
                                title="Copy year 2 dollar increase"
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                            </span>
                          )
                          : 'Split increase'
                        }
                      </div>
                      {scenarios.twoYear?.increases.length === 2 && <div className="text-xs md:text-sm text-muted-foreground italic">Year 1 / Year 2 amounts shown above</div>}
                    </TableCell>
                  </TableRow>

                  {/* Preferential rent row if applicable */}
                  {inputs.preferentialRent && scenarios.oneYear?.preferentialResult && scenarios.twoYear?.preferentialResult && <TableRow className="bg-secondary/50 border-b-2 border-secondary">
                      <TableCell className="font-semibold text-secondary-foreground">
        <div className="flex items-center justify-center gap-2">
          <div className="text-xl font-bold text-secondary-foreground">{formatCurrency(inputs.preferentialRent)}</div>
          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(inputs.preferentialRent!, 'current preferential rent')} title="Copy current preferential rent">
            <Copy className="h-2 w-2" />
          </Button>
        </div>
                        <div className="text-xs md:text-sm text-calculator-header font-semibold text-center">Preferential Rent (Tenant Pays)</div>
                      </TableCell>
                      <TableCell className="text-center space-y-1 px-2 sm:px-4">
                        {scenarios.oneYear?.increases.length === 2 ? <div className="flex items-center justify-center gap-2 relative">
            <div className="flex items-center justify-center gap-2">
              <div className="text-sm sm:text-lg font-bold text-secondary-foreground">
                {formatCurrency(scenarios.oneYear.increases[0].newRent === inputs.preferentialRent ? inputs.preferentialRent! : inputs.preferentialRent! * (1 + scenarios.oneYear.increases[0].percentIncrease / 100))}
              </div>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(scenarios.oneYear.increases[0].newRent === inputs.preferentialRent ? inputs.preferentialRent! : inputs.preferentialRent! * (1 + scenarios.oneYear.increases[0].percentIncrease / 100), '1-year preferential year 1')} title="Copy Year 1 preferential amount">
                <Copy className="h-2 w-2" />
              </Button>
            </div>
                            <div className="text-sm sm:text-lg font-bold text-secondary-foreground">/</div>
            <div className="flex items-center justify-center gap-2">
              <div className="text-sm sm:text-lg font-bold text-secondary-foreground">
                {formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}
              </div>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(scenarios.oneYear.preferentialResult.newTenantPay, '1-year preferential final')} title="Copy final preferential amount">
                <Copy className="h-2 w-2" />
              </Button>
            </div>
                          </div> : <div className="flex items-center justify-center gap-2">
                            <div className="text-sm sm:text-lg font-bold text-secondary-foreground">
                              {formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}
                            </div>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(scenarios.oneYear.preferentialResult.newTenantPay, '1-year preferential')} title="Copy preferential amount">
                              <Copy className="h-2 w-2" />
                            </Button>
                          </div>}
                        <div className="text-sm md:text-base text-muted-foreground whitespace-nowrap">
                          {scenarios.oneYear?.increases.length === 1 
                            ? (
                              <span className="inline-flex items-center gap-1">
                                {formatPercent(scenarios.oneYear.increases[0].percentIncrease)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                  onClick={() => copyLeaseAmount(`${scenarios.oneYear.increases[0].percentIncrease}%`, '1-year preferential percentage increase')}
                                  title="Copy percentage increase"
                                >
                                  <Copy className="h-2 w-2" />
                                </Button>
                                | {formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay - inputs.preferentialRent)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                  onClick={() => copyLeaseAmount(scenarios.oneYear.preferentialResult.newTenantPay - inputs.preferentialRent, '1-year preferential dollar increase')}
                                  title="Copy preferential dollar increase"
                                >
                                  <Copy className="h-2 w-2" />
                                </Button>
                              </span>
                            )
                            : scenarios.oneYear?.increases.length === 2 
                            ? (
                              <span className="inline-flex items-center gap-1">
                                {formatPercent(scenarios.oneYear.increases[0].percentIncrease)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                  onClick={() => copyLeaseAmount(`${scenarios.oneYear.increases[0].percentIncrease}%`, '1-year preferential year 1 percentage increase')}
                                  title="Copy year 1 percentage increase"
                                >
                                  <Copy className="h-2 w-2" />
                                </Button>
                                / {formatPercent(scenarios.oneYear.increases[1].percentIncrease)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                  onClick={() => copyLeaseAmount(`${scenarios.oneYear.increases[1].percentIncrease}%`, '1-year preferential year 2 percentage increase')}
                                  title="Copy year 2 percentage increase"
                                >
                                  <Copy className="h-2 w-2" />
                                </Button>
                                | {formatCurrency(inputs.preferentialRent! * scenarios.oneYear.increases[0].percentIncrease / 100)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                  onClick={() => copyLeaseAmount(inputs.preferentialRent! * scenarios.oneYear.increases[0].percentIncrease / 100, '1-year preferential year 1 dollar increase')}
                                  title="Copy year 1 preferential dollar increase"
                                >
                                  <Copy className="h-2 w-2" />
                                </Button>
                                / {formatCurrency(inputs.preferentialRent! * (1 + scenarios.oneYear.increases[0].percentIncrease / 100) * scenarios.oneYear.increases[1].percentIncrease / 100)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                  onClick={() => copyLeaseAmount(inputs.preferentialRent! * (1 + scenarios.oneYear.increases[0].percentIncrease / 100) * scenarios.oneYear.increases[1].percentIncrease / 100, '1-year preferential year 2 dollar increase')}
                                  title="Copy year 2 preferential dollar increase"
                                >
                                  <Copy className="h-2 w-2" />
                                </Button>
                              </span>
                            )
                            : 'N/A'
                          }
                        </div>
                        {scenarios.oneYear?.increases.length === 2 && <div className="text-xs md:text-sm text-muted-foreground italic">
                            {scenarios.oneYear.increases[0].period} / {scenarios.oneYear.increases[1].period}
                          </div>}
                      </TableCell>
                      <TableCell className="text-center space-y-1 px-2 sm:px-4">
                        {scenarios.twoYear?.preferentialResult && scenarios.twoYear.increases.length === 2 ? <div className="flex items-center justify-center gap-2 relative">
            <div className="flex items-center justify-center gap-2">
              <div className="text-sm sm:text-lg font-bold text-secondary-foreground">
                {formatCurrency(scenarios.twoYear.preferentialResult.year1Amount || inputs.preferentialRent!)}
              </div>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(scenarios.twoYear.preferentialResult.year1Amount || inputs.preferentialRent!, '2-year preferential year 1')} title="Copy Year 1 preferential amount">
                <Copy className="h-2 w-2" />
              </Button>
            </div>
                            <div className="text-sm sm:text-lg font-bold text-secondary-foreground">/</div>
            <div className="flex items-center justify-center gap-2">
              <div className="text-sm sm:text-lg font-bold text-secondary-foreground">
                {formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}
              </div>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(scenarios.twoYear.preferentialResult.newTenantPay, '2-year preferential final')} title="Copy final preferential amount">
                <Copy className="h-2 w-2" />
              </Button>
            </div>
                          </div> : <div className="flex items-center justify-center gap-2">
                            <div className="text-sm sm:text-lg font-bold text-secondary-foreground">
                              {formatCurrency(scenarios.twoYear?.preferentialResult?.newTenantPay || inputs.preferentialRent!)}
                            </div>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(scenarios.twoYear?.preferentialResult?.newTenantPay || inputs.preferentialRent!, '2-year preferential')} title="Copy preferential amount">
                              <Copy className="h-2 w-2" />
                            </Button>
                          </div>}
                        <div className="text-sm md:text-base text-muted-foreground whitespace-nowrap">
                          {scenarios.twoYear?.increases.length === 1 
                            ? (
                              <span className="inline-flex items-center gap-1">
                                {formatPercent(scenarios.twoYear.increases[0].percentIncrease)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                  onClick={() => copyLeaseAmount(`${scenarios.twoYear.increases[0].percentIncrease}%`, '2-year preferential percentage increase')}
                                  title="Copy percentage increase"
                                >
                                  <Copy className="h-2 w-2" />
                                </Button>
                                | {formatCurrency((scenarios.twoYear.preferentialResult?.newTenantPay || 0) - (inputs.preferentialRent || 0))}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                  onClick={() => copyLeaseAmount((scenarios.twoYear.preferentialResult?.newTenantPay || 0) - (inputs.preferentialRent || 0), '2-year preferential dollar increase')}
                                  title="Copy preferential dollar increase"
                                >
                                  <Copy className="h-2 w-2" />
                                </Button>
                              </span>
                            )
                            : scenarios.twoYear?.increases.length === 2 
                            ? (
                              <span className="inline-flex items-center gap-1">
                                {formatPercent(scenarios.twoYear.increases[0].percentIncrease)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                  onClick={() => copyLeaseAmount(`${scenarios.twoYear.increases[0].percentIncrease}%`, '2-year preferential year 1 percentage increase')}
                                  title="Copy year 1 percentage increase"
                                >
                                  <Copy className="h-2 w-2" />
                                </Button>
                                / {formatPercent(scenarios.twoYear.increases[1].percentIncrease)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                  onClick={() => copyLeaseAmount(`${scenarios.twoYear.increases[1].percentIncrease}%`, '2-year preferential year 2 percentage increase')}
                                  title="Copy year 2 percentage increase"
                                >
                                  <Copy className="h-2 w-2" />
                                </Button>
                                | {formatCurrency(inputs.preferentialRent! * scenarios.twoYear.increases[0].percentIncrease / 100)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                  onClick={() => copyLeaseAmount(inputs.preferentialRent! * scenarios.twoYear.increases[0].percentIncrease / 100, '2-year preferential year 1 dollar increase')}
                                  title="Copy year 1 preferential dollar increase"
                                >
                                  <Copy className="h-2 w-2" />
                                </Button>
                                / {formatCurrency((scenarios.twoYear.preferentialResult?.year1Amount || inputs.preferentialRent!) * scenarios.twoYear.increases[1].percentIncrease / 100)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-3 w-3 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                                  onClick={() => copyLeaseAmount((scenarios.twoYear.preferentialResult?.year1Amount || inputs.preferentialRent!) * scenarios.twoYear.increases[1].percentIncrease / 100, '2-year preferential year 2 dollar increase')}
                                  title="Copy year 2 preferential dollar increase"
                                >
                                  <Copy className="h-2 w-2" />
                                </Button>
                              </span>
                            )
                            : 'Split increase'
                          }
                        </div>
                        {scenarios.twoYear?.increases.length === 2 && <div className="text-xs md:text-sm text-muted-foreground italic">Year 1 / Year 2 amounts shown above</div>}
                      </TableCell>
                    </TableRow>}
                </TableBody>
              </Table>
            </div>

            {/* Applied rule and breakdown */}
            <div className="mt-6">
              <div className="text-sm md:text-base">
                <span className="font-medium text-muted-foreground">Applied Rule: </span>
                <span className="font-medium">
                  {(() => {
                const oneYearGuideline = getGuideline(inputs.leaseStartDate, 1);
                const twoYearGuideline = getGuideline(inputs.leaseStartDate, 2);
                const oneYearRule = oneYearGuideline?.rule;
                const twoYearRule = twoYearGuideline?.rule;
                return <span className="inline-flex flex-wrap items-center gap-2">
                        <span>1-Year:</span>
                        {oneYearRule?.type === 'flat' && <span className="inline-flex items-center gap-1">
                            {oneYearRule.pct}%
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(`${oneYearRule.pct}%`, '1-year rate')} title="Copy 1-year rate">
                              <Copy className="h-2.5 w-2.5" />
                            </Button>
                          </span>}
                        {oneYearRule?.type === 'split' && <span className="inline-flex items-center gap-1">
                            {oneYearRule.year1_pct}%
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(`${oneYearRule.year1_pct}%`, '1-year year 1 rate')} title="Copy 1-year year 1 rate">
                              <Copy className="h-2.5 w-2.5" />
                            </Button>
                            <span>/</span>
                            {oneYearRule.year2_pct_on_year1_rent}%
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(`${oneYearRule.year2_pct_on_year1_rent}%`, '1-year year 2 rate')} title="Copy 1-year year 2 rate">
                              <Copy className="h-2.5 w-2.5" />
                            </Button>
                          </span>}
                        {oneYearRule?.type === 'split_by_month' && <span className="inline-flex items-center gap-1">
                            {oneYearRule.first_pct}%
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(`${oneYearRule.first_pct}%`, '1-year first period rate')} title="Copy 1-year first period rate">
                              <Copy className="h-2.5 w-2.5" />
                            </Button>
                            <span>/</span>
                            {oneYearRule.remaining_months_pct}%
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(`${oneYearRule.remaining_months_pct}%`, '1-year remaining period rate')} title="Copy 1-year remaining period rate">
                              <Copy className="h-2.5 w-2.5" />
                            </Button>
                          </span>}
                        {!oneYearRule && <span>N/A</span>}
                        
                        <span className="mx-2">|</span>
                        
                        <span>2-Year:</span>
                        {twoYearRule?.type === 'flat' && <span className="inline-flex items-center gap-1">
                            {twoYearRule.pct}%
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(`${twoYearRule.pct}%`, '2-year rate')} title="Copy 2-year rate">
                              <Copy className="h-2.5 w-2.5" />
                            </Button>
                          </span>}
                        {twoYearRule?.type === 'split' && <span className="inline-flex items-center gap-1">
                            {twoYearRule.year1_pct}%
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(`${twoYearRule.year1_pct}%`, '2-year year 1 rate')} title="Copy 2-year year 1 rate">
                              <Copy className="h-2.5 w-2.5" />
                            </Button>
                            <span>/</span>
                            {twoYearRule.year2_pct_on_year1_rent}%
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(`${twoYearRule.year2_pct_on_year1_rent}%`, '2-year year 2 rate')} title="Copy 2-year year 2 rate">
                              <Copy className="h-2.5 w-2.5" />
                            </Button>
                          </span>}
                        {twoYearRule?.type === 'split_by_month' && <span className="inline-flex items-center gap-1">
                            {twoYearRule.first_pct}%
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(`${twoYearRule.first_pct}%`, '2-year first period rate')} title="Copy 2-year first period rate">
                              <Copy className="h-2.5 w-2.5" />
                            </Button>
                            <span>/</span>
                            {twoYearRule.remaining_months_pct}%
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => copyLeaseAmount(`${twoYearRule.remaining_months_pct}%`, '2-year remaining period rate')} title="Copy 2-year remaining period rate">
                              <Copy className="h-2.5 w-2.5" />
                            </Button>
                          </span>}
                        {!twoYearRule && <span>N/A</span>}
                      </span>;
              })()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>}



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
    </div>;
}