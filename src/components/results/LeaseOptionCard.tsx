import React from 'react';
import { Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className="bg-gradient-to-br from-calculator-success/5 to-calculator-primary/5 rounded-lg p-4 sm:p-6 border border-calculator-success/20 min-h-[120px] flex flex-col justify-center">
      <div className="text-center mb-4">
        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-calculator-success mb-2">
          {hasMultipleIncreases ? 
            `${formatCurrency(scenario.increases[0].newRent)} / ${formatCurrency(finalRent)}` :
            formatCurrency(finalRent)
          }
        </div>
        <div className="text-sm sm:text-base text-muted-foreground mb-3">
          {hasMultipleIncreases ? 
            `${formatPercent(scenario.increases[0].percentIncrease)} / ${formatPercent(scenario.increases[1].percentIncrease)} | ${formatCurrency(scenario.increases[0].dollarIncrease)} / ${formatCurrency(scenario.increases[1].dollarIncrease)}` :
            `${formatPercent(scenario.increases[0].percentIncrease)} | ${formatCurrency(scenario.increases[0].dollarIncrease)}`
          }
        </div>
        
        {preferentialRent && finalTenantPay && (
          <>
            <div className="text-xl sm:text-2xl font-bold text-calculator-primary mb-2">
              {hasMultipleIncreases && scenario.preferentialResult?.year1Amount ? 
                `${formatCurrency(scenario.preferentialResult.year1Amount)} / ${formatCurrency(finalTenantPay)}` :
                formatCurrency(finalTenantPay)
              }
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              Tenant Pays (Preferential)
            </div>
          </>
        )}

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopyAmount(finalRent, `${title} Legal Rent`)}
            className="text-xs"
          >
            <Clipboard className="h-3 w-3 mr-1" />
            Legal: {formatCurrency(finalRent)}
          </Button>
          
          {preferentialRent && finalTenantPay && (
            <Button
              size="sm" 
              variant="outline"
              onClick={() => onCopyAmount(finalTenantPay, `${title} Tenant Pay`)}
              className="text-xs"
            >
              <Clipboard className="h-3 w-3 mr-1" />
              Tenant: {formatCurrency(finalTenantPay)}
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs px-2 py-1">
            Starts: {scenario.increases[0].period}
          </Badge>
          
          {hasMultipleIncreases && (
            <Badge variant="secondary" className="text-xs px-2 py-1 ml-2">
              Then: {scenario.increases[1].period}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}