import React from 'react';
import { Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalculationResult } from '@/types/rgb';
import { formatCurrency, formatPercent } from '@/utils/rentCalculator';

interface LeaseOptionCardProps {
  title: string;
  scenario: CalculationResult;
  preferentialRent?: number;
  onCopyAmount: (amount: number, type: string) => void;
  onCopyDate: (date: string) => void;
}

export default function LeaseOptionCard({ 
  title, 
  scenario, 
  preferentialRent, 
  onCopyAmount, 
  onCopyDate 
}: LeaseOptionCardProps) {
  const hasMultipleIncreases = scenario.increases.length > 1;
  const finalRent = scenario.newLegalRent;
  const finalTenantPay = scenario.preferentialResult?.newTenantPay;

  // Always show as # / # format, using the same number twice if only one increase
  const legalRentDisplay = hasMultipleIncreases ? 
    `${formatCurrency(scenario.increases[0].newRent)} / ${formatCurrency(finalRent)}` :
    `${formatCurrency(finalRent)} / ${formatCurrency(finalRent)}`;

  const tenantPayDisplay = preferentialRent && finalTenantPay ? (
    hasMultipleIncreases && scenario.preferentialResult?.year1Amount ? 
      `${formatCurrency(scenario.preferentialResult.year1Amount)} / ${formatCurrency(finalTenantPay)}` :
      `${formatCurrency(finalTenantPay)} / ${formatCurrency(finalTenantPay)}`
  ) : null;

  return (
    <div className="bg-gradient-to-br from-calculator-success/5 to-calculator-primary/5 rounded-lg p-4 sm:p-6 border border-calculator-success/20 min-h-[120px] flex flex-col justify-center">
      <div className="text-center">
        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-calculator-success mb-2">
          {legalRentDisplay}
        </div>
        <div className="flex justify-center mb-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onCopyAmount(finalRent, `${title} Legal Rent`)}
            className="p-1 h-8 w-8"
          >
            <Clipboard className="h-4 w-4" />
          </Button>
        </div>
        
        {tenantPayDisplay && (
          <>
            <div className="text-xl sm:text-2xl font-bold text-calculator-primary mb-2">
              {tenantPayDisplay}
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              Tenant Pays (Preferential)
            </div>
            <div className="flex justify-center mb-3">
              <Button
                size="sm" 
                variant="ghost"
                onClick={() => onCopyAmount(finalTenantPay, `${title} Tenant Pay`)}
                className="p-1 h-8 w-8"
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}