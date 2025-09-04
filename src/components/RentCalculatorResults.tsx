import React from 'react';
import { Clipboard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalculationResult } from '../types/rgb';
import { formatCurrency, formatPercent, getGuideline } from '../utils/rentCalculator';
import { useToast } from '@/hooks/use-toast';
import ResultsHeader from './results/ResultsHeader';
import CurrentRentDisplay from './results/CurrentRentDisplay';
import LeaseOptionCard from './results/LeaseOptionCard';
import PrintView from './results/PrintView';

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

  const copyDate = async (dateText: string) => {
    try {
      // Extract just the date value (MM/DD/YYYY format)
      const dateValue = dateText.replace(/^(Starts:|Ends:|Then:)\s*/, '');
      await navigator.clipboard.writeText(dateValue);
      toast({
        title: "Date copied",
        description: `${dateValue} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyRule = async (rule: string, leaseType: string) => {
    try {
      // Extract just the percentage from the rule (e.g., "3%" from "3% increase")
      const percentageMatch = rule.match(/(\d+(?:\.\d+)?%)/);
      const percentageValue = percentageMatch ? percentageMatch[1] : rule;
      
      await navigator.clipboard.writeText(percentageValue);
      toast({
        title: "Rate copied",
        description: `${leaseType} rate "${percentageValue}" copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    const currentTitle = document.title;
    const date = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const addressPart = inputs.address ? `-${inputs.address.split(',')[0].replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}` : '';
    const unitPart = inputs.unit ? `-${inputs.unit.replace(/\s/g, '')}` : '';
    document.title = `NYC-Rent-Calculation-${date}${addressPart}${unitPart}-RGB${scenarios.orderNumber}`;
    
    window.print();
    
    setTimeout(() => {
      document.title = currentTitle;
    }, 1000);
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <PrintView
        orderNumber={scenarios.orderNumber}
        address={inputs.address}
        unit={inputs.unit}
        leaseStartDate={inputs.leaseStartDate}
        effectivePeriod={scenarios.effectivePeriod}
        currentRent={inputs.currentRent}
        preferentialRent={inputs.preferentialRent}
        oneYear={scenarios.oneYear}
        twoYear={scenarios.twoYear}
      />

      <Card className="w-full shadow-lg border-0 print:hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        <ResultsHeader
          orderNumber={scenarios.orderNumber}
          address={inputs.address}
          unit={inputs.unit}
          effectivePeriod={scenarios.effectivePeriod}
          onCopyResults={copyToClipboard}
          onPrint={handlePrint}
        />
        
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">Current Rent</h3>
              <CurrentRentDisplay
                currentRent={inputs.currentRent}
                preferentialRent={inputs.preferentialRent}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">1-Year Lease Option</h3>
              <LeaseOptionCard
                title="1-Year"
                scenario={scenarios.oneYear}
                preferentialRent={inputs.preferentialRent}
                onCopyAmount={copyLeaseAmount}
                onCopyDate={copyDate}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">2-Year Lease Option</h3>
              <LeaseOptionCard
                title="2-Year"
                scenario={scenarios.twoYear}
                preferentialRent={inputs.preferentialRent}
                onCopyAmount={copyLeaseAmount}
                onCopyDate={copyDate}
              />
            </div>
          </div>

          <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-muted-foreground/20">
            <h4 className="font-semibold text-lg mb-4">Applied Rule:</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium">
                  <span className="font-semibold">1-Year:</span> Order #{scenarios.orderNumber}, {scenarios.oneYear.appliedRule}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyRule(scenarios.oneYear.appliedRule, "1-Year")}
                  className="ml-2"
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-medium">
                  <span className="font-semibold">2-Year:</span> Order #{scenarios.orderNumber}, {scenarios.twoYear.appliedRule}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyRule(scenarios.twoYear.appliedRule, "2-Year")}
                  className="ml-2"
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive-foreground">
              <strong>Important:</strong> This calculator provides estimates based on NYC Rent Guidelines Board orders. 
              Results are for informational purposes only and do not constitute legal advice. Always consult official 
              sources and consider seeking legal counsel for specific situations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}