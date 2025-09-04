import React from 'react';
import { Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalculationResult } from '../types/rgb';
import { formatCurrency, formatPercent, getGuideline } from '../utils/rentCalculator';

interface MobileRentResultsProps {
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
  onCopyAmount: (amount: number | string, leaseType: string) => void;
}

export default function MobileRentResults({ result, inputs, onCopyAmount }: MobileRentResultsProps) {
  const scenarios = {
    oneYear: result.oneYear,
    twoYear: result.twoYear,
  };

  const oneYearGuideline = getGuideline(inputs.leaseStartDate, 1);
  const twoYearGuideline = getGuideline(inputs.leaseStartDate, 2);

  const getAppliedRule = (guideline: any) => {
    if (!guideline) return 'N/A';
    
    if (guideline.rule.type === 'flat') {
      return `${guideline.rule.pct}%`;
    } else if (guideline.rule.type === 'split') {
      return `${guideline.rule.year1_pct}% / ${guideline.rule.year2_pct_on_year1_rent}%`;
    } else if (guideline.rule.type === 'split_by_month') {
      return `${guideline.rule.first_pct}% / ${guideline.rule.remaining_months_pct}%`;
    }
    return 'N/A';
  };

  return (
    <div className="block md:hidden space-y-4">
      {/* Current Rent Section */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-center">Current Rent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(inputs.currentRent)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground mt-2"
                onClick={() => onCopyAmount(inputs.currentRent, 'current legal rent')}
                title="Copy current legal rent"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">Legal Regulated Rent</div>
          </div>
          
          {inputs.preferentialRent && (
            <div className="text-center pt-2 border-t">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-calculator-info">
                  {formatCurrency(inputs.preferentialRent)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground mt-2"
                  onClick={() => onCopyAmount(inputs.preferentialRent!, 'current preferential rent')}
                  title="Copy current preferential rent"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Tenant Currently Pays (Preferential)</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1-Year Lease Section */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-center">1-Year Lease Option</CardTitle>
          <div className="text-xs md:text-sm text-center text-muted-foreground py-2">
            Lease End: {new Date(inputs.leaseStartDate.getFullYear() + 1, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Legal Rent */}
          <div className="text-center">
            <div className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Legal Regulated Rent</div>
            {scenarios.oneYear?.increases.length === 2 ? (
              <div className="flex items-center justify-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="text-xl font-bold text-calculator-success">
                    {formatCurrency(scenarios.oneYear.increases[0].newRent)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground mt-1"
                    onClick={() => onCopyAmount(scenarios.oneYear.increases[0].newRent, '1-year year 1')}
                    title="Copy Year 1 amount"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xl font-bold text-calculator-success">/</div>
                <div className="flex flex-col items-center">
                  <div className="text-xl font-bold text-calculator-success">
                    {formatCurrency(scenarios.oneYear.newLegalRent)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground mt-1"
                    onClick={() => onCopyAmount(scenarios.oneYear.newLegalRent, '1-year final')}
                    title="Copy final amount"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-calculator-success">
                  {formatCurrency(scenarios.oneYear?.newLegalRent || inputs.currentRent)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground mt-2"
                  onClick={() => onCopyAmount(scenarios.oneYear?.newLegalRent || inputs.currentRent, '1-year')}
                  title="Copy amount"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            <div className="text-xs md:text-sm text-muted-foreground mt-2">
              {scenarios.oneYear?.increases.length === 1 
                ? (
                  <span className="inline-flex items-center gap-1">
                    {formatPercent(scenarios.oneYear.increases[0].percentIncrease)} | {formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                      onClick={() => onCopyAmount(scenarios.oneYear.increases[0].dollarIncrease, '1-year dollar increase')}
                      title="Copy dollar increase"
                    >
                      <Copy className="h-2.5 w-2.5" />
                    </Button>
                  </span>
                )
                : scenarios.oneYear?.increases.length === 2
                ? (
                  <span className="inline-flex items-center gap-1">
                    {formatPercent(scenarios.oneYear.increases[0].percentIncrease)} / {formatPercent(scenarios.oneYear.increases[1].percentIncrease)} | {formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                      onClick={() => onCopyAmount(scenarios.oneYear.increases[0].dollarIncrease, '1-year year 1 dollar increase')}
                      title="Copy year 1 dollar increase"
                    >
                      <Copy className="h-2.5 w-2.5" />
                    </Button>
                    / {formatCurrency(scenarios.oneYear.increases[1].dollarIncrease)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                      onClick={() => onCopyAmount(scenarios.oneYear.increases[1].dollarIncrease, '1-year year 2 dollar increase')}
                      title="Copy year 2 dollar increase"
                    >
                      <Copy className="h-2.5 w-2.5" />
                    </Button>
                  </span>
                )
                : 'N/A'
              }
            </div>
            
            {scenarios.oneYear?.increases.length === 2 && (
              <div className="text-xs md:text-sm text-muted-foreground italic mt-1">
                {scenarios.oneYear.increases[0].period} / {scenarios.oneYear.increases[1].period}
              </div>
            )}
          </div>

          {/* Preferential Rent if applicable */}
          {inputs.preferentialRent && scenarios.oneYear?.preferentialResult && (
            <div className="text-center pt-3 border-t">
              <div className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Tenant Pays (Preferential)</div>
              {scenarios.oneYear.increases.length === 2 ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="text-xl font-bold text-calculator-info">
                      {formatCurrency(scenarios.oneYear.increases[0].newRent === inputs.preferentialRent ? inputs.preferentialRent! : (inputs.preferentialRent! * (1 + scenarios.oneYear.increases[0].percentIncrease / 100)))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground mt-1"
                      onClick={() => onCopyAmount(scenarios.oneYear.increases[0].newRent === inputs.preferentialRent ? inputs.preferentialRent! : (inputs.preferentialRent! * (1 + scenarios.oneYear.increases[0].percentIncrease / 100)), '1-year preferential year 1')}
                      title="Copy Year 1 preferential amount"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xl font-bold text-calculator-info">/</div>
                  <div className="flex flex-col items-center">
                    <div className="text-xl font-bold text-calculator-info">
                      {formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground mt-1"
                      onClick={() => onCopyAmount(scenarios.oneYear.preferentialResult.newTenantPay, '1-year preferential final')}
                      title="Copy final preferential amount"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold text-calculator-info">
                    {formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground mt-2"
                    onClick={() => onCopyAmount(scenarios.oneYear.preferentialResult.newTenantPay, '1-year preferential')}
                    title="Copy preferential amount"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <div className="text-xs md:text-sm text-muted-foreground mt-2">
                {scenarios.oneYear?.increases.length === 1 
                  ? (
                    <span className="inline-flex items-center gap-1">
                      {formatPercent(scenarios.oneYear.increases[0].percentIncrease)} | {formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay - (inputs.preferentialRent || 0))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount(scenarios.oneYear.preferentialResult.newTenantPay - (inputs.preferentialRent || 0), '1-year preferential dollar increase')}
                        title="Copy preferential dollar increase"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                    </span>
                  )
                  : scenarios.oneYear?.increases.length === 2
                  ? (
                    <span className="inline-flex items-center gap-1">
                      {formatPercent(scenarios.oneYear.increases[0].percentIncrease)} / {formatPercent(scenarios.oneYear.increases[1].percentIncrease)} | {formatCurrency(inputs.preferentialRent! * scenarios.oneYear.increases[0].percentIncrease / 100)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount(inputs.preferentialRent! * scenarios.oneYear.increases[0].percentIncrease / 100, '1-year preferential year 1 dollar increase')}
                        title="Copy year 1 preferential dollar increase"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                      / {formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay - (scenarios.oneYear.preferentialResult.year1Amount || inputs.preferentialRent!))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount(scenarios.oneYear.preferentialResult.newTenantPay - (scenarios.oneYear.preferentialResult.year1Amount || inputs.preferentialRent!), '1-year preferential year 2 dollar increase')}
                        title="Copy year 2 preferential dollar increase"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                    </span>
                  )
                  : 'N/A'
                }
              </div>
              
              {scenarios.oneYear?.increases.length === 2 && (
                <div className="text-xs md:text-sm text-muted-foreground italic mt-1">
                  {scenarios.oneYear.increases[0].period} / {scenarios.oneYear.increases[1].period}
                </div>
              )}
            </div>
          )}

          {/* Copy Dollar Increases Button */}
          <div className="text-center pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="mb-2"
              onClick={() => {
                const increases = scenarios.oneYear?.increases || [];
                if (increases.length === 1) {
                  onCopyAmount(`1-Year Increases: ${formatCurrency(increases[0].dollarIncrease)}`, '1-year dollar increases');
                } else if (increases.length === 2) {
                  onCopyAmount(`1-Year Increases: ${formatCurrency(increases[0].dollarIncrease)}, ${formatCurrency(increases[1].dollarIncrease)}`, '1-year dollar increases');
                }
              }}
              title="Copy all 1-year dollar increases"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Dollar Increases
            </Button>
          </div>

          {/* Applied Rule */}
          <div className="text-center pt-3 border-t">
            <div className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Applied Rule</div>
            <div className="inline-flex flex-wrap items-center justify-center gap-2">
              {(() => {
                const rule = oneYearGuideline?.rule;
                if (!rule) return <span className="text-xs md:text-sm font-semibold">N/A</span>;
                
                if (rule.type === 'flat') {
                  return (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-xs md:text-sm font-semibold">{rule.pct}%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount(`${rule.pct}%`, '1-year rate')}
                        title="Copy 1-year rate"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                    </span>
                  );
                } else if (rule.type === 'split') {
                  return (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-xs md:text-sm font-semibold">{rule.year1_pct}%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount(`${rule.year1_pct}%`, '1-year year 1 rate')}
                        title="Copy year 1 rate"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                      <span className="text-xs md:text-sm font-semibold">/</span>
                      <span className="text-xs md:text-sm font-semibold">{rule.year2_pct_on_year1_rent}%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount(`${rule.year2_pct_on_year1_rent}%`, '1-year year 2 rate')}
                        title="Copy year 2 rate"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                    </span>
                  );
                } else if (rule.type === 'split_by_month') {
                  return (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-xs md:text-sm font-semibold">{rule.first_pct}%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount(`${rule.first_pct}%`, '1-year first period rate')}
                        title="Copy first period rate"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                      <span className="text-xs md:text-sm font-semibold">/</span>
                      <span className="text-xs md:text-sm font-semibold">{rule.remaining_months_pct}%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount(`${rule.remaining_months_pct}%`, '1-year remaining period rate')}
                        title="Copy remaining period rate"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                    </span>
                  );
                }
                return <span className="text-xs md:text-sm font-semibold">N/A</span>;
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2-Year Lease Section */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-center">2-Year Lease Option</CardTitle>
          <div className="text-xs md:text-sm text-center text-muted-foreground py-2">
            Lease End: {new Date(inputs.leaseStartDate.getFullYear() + 2, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Legal Rent */}
          <div className="text-center">
            <div className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Legal Regulated Rent</div>
            {scenarios.twoYear?.increases.length === 2 ? (
              <div className="flex items-center justify-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="text-xl font-bold text-calculator-success">
                    {formatCurrency(scenarios.twoYear.increases[0].newRent)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground mt-1"
                    onClick={() => onCopyAmount(scenarios.twoYear.increases[0].newRent, '2-year year 1')}
                    title="Copy Year 1 amount"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xl font-bold text-calculator-success">/</div>
                <div className="flex flex-col items-center">
                  <div className="text-xl font-bold text-calculator-success">
                    {formatCurrency(scenarios.twoYear.newLegalRent)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground mt-1"
                    onClick={() => onCopyAmount(scenarios.twoYear.newLegalRent, '2-year final')}
                    title="Copy final amount"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-calculator-success">
                  {formatCurrency(scenarios.twoYear?.newLegalRent || inputs.currentRent)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground mt-2"
                  onClick={() => onCopyAmount(scenarios.twoYear?.newLegalRent || inputs.currentRent, '2-year')}
                  title="Copy amount"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            <div className="text-xs md:text-sm text-muted-foreground mt-2">
              {scenarios.twoYear?.increases.length === 1 
                ? (
                  <span className="inline-flex items-center gap-1">
                    {formatPercent(scenarios.twoYear.increases[0].percentIncrease)} | {formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                      onClick={() => onCopyAmount(scenarios.twoYear.increases[0].dollarIncrease, '2-year dollar increase')}
                      title="Copy dollar increase"
                    >
                      <Copy className="h-2.5 w-2.5" />
                    </Button>
                  </span>
                )
                : scenarios.twoYear?.increases.length === 2
                ? (
                  <span className="inline-flex items-center gap-1">
                    {formatPercent(scenarios.twoYear.increases[0].percentIncrease)} / {formatPercent(scenarios.twoYear.increases[1].percentIncrease)} | {formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                      onClick={() => onCopyAmount(scenarios.twoYear.increases[0].dollarIncrease, '2-year year 1 dollar increase')}
                      title="Copy year 1 dollar increase"
                    >
                      <Copy className="h-2.5 w-2.5" />
                    </Button>
                    / {formatCurrency(scenarios.twoYear.increases[1].dollarIncrease)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                      onClick={() => onCopyAmount(scenarios.twoYear.increases[1].dollarIncrease, '2-year year 2 dollar increase')}
                      title="Copy year 2 dollar increase"
                    >
                      <Copy className="h-2.5 w-2.5" />
                    </Button>
                  </span>
                )
                : 'Split increase'
              }
            </div>
            
            {scenarios.twoYear?.increases.length === 2 && (
              <div className="text-xs md:text-sm text-muted-foreground italic mt-1">
                {scenarios.twoYear.increases[0].period} / {scenarios.twoYear.increases[1].period}
              </div>
            )}
          </div>

          {/* Preferential Rent if applicable */}
          {inputs.preferentialRent && scenarios.twoYear?.preferentialResult && (
            <div className="text-center pt-3 border-t">
              <div className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Tenant Pays (Preferential)</div>
              {scenarios.twoYear.increases.length === 2 ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="text-xl font-bold text-calculator-info">
                      {formatCurrency(scenarios.twoYear.preferentialResult.year1Amount || inputs.preferentialRent!)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground mt-1"
                      onClick={() => onCopyAmount(scenarios.twoYear.preferentialResult.year1Amount || inputs.preferentialRent!, '2-year preferential year 1')}
                      title="Copy Year 1 preferential amount"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xl font-bold text-calculator-info">/</div>
                  <div className="flex flex-col items-center">
                    <div className="text-xl font-bold text-calculator-info">
                      {formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground mt-1"
                      onClick={() => onCopyAmount(scenarios.twoYear.preferentialResult.newTenantPay, '2-year preferential final')}
                      title="Copy final preferential amount"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold text-calculator-info">
                    {formatCurrency(scenarios.twoYear?.preferentialResult?.newTenantPay || inputs.preferentialRent!)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground mt-2"
                    onClick={() => onCopyAmount(scenarios.twoYear?.preferentialResult?.newTenantPay || inputs.preferentialRent!, '2-year preferential')}
                    title="Copy preferential amount"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <div className="text-xs md:text-sm text-muted-foreground mt-2">
                {scenarios.twoYear?.increases.length === 1 
                  ? (
                    <span className="inline-flex items-center gap-1">
                      {formatPercent(scenarios.twoYear.increases[0].percentIncrease)} | {formatCurrency((scenarios.twoYear?.preferentialResult?.newTenantPay || 0) - (inputs.preferentialRent || 0))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount((scenarios.twoYear?.preferentialResult?.newTenantPay || 0) - (inputs.preferentialRent || 0), '2-year preferential dollar increase')}
                        title="Copy preferential dollar increase"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                    </span>
                  )
                  : scenarios.twoYear?.increases.length === 2
                  ? (
                    <span className="inline-flex items-center gap-1">
                      {formatPercent(scenarios.twoYear.increases[0].percentIncrease)} / {formatPercent(scenarios.twoYear.increases[1].percentIncrease)} | {formatCurrency(inputs.preferentialRent! * scenarios.twoYear.increases[0].percentIncrease / 100)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount(inputs.preferentialRent! * scenarios.twoYear.increases[0].percentIncrease / 100, '2-year preferential year 1 dollar increase')}
                        title="Copy year 1 preferential dollar increase"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                      / {formatCurrency((scenarios.twoYear?.preferentialResult?.newTenantPay || 0) - (scenarios.twoYear.preferentialResult.year1Amount || inputs.preferentialRent!))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount((scenarios.twoYear?.preferentialResult?.newTenantPay || 0) - (scenarios.twoYear.preferentialResult.year1Amount || inputs.preferentialRent!), '2-year preferential year 2 dollar increase')}
                        title="Copy year 2 preferential dollar increase"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                    </span>
                  )
                  : 'N/A'
                }
              </div>
              
              {scenarios.twoYear?.increases.length === 2 && (
                <div className="text-xs md:text-sm text-muted-foreground italic mt-1">
                  {scenarios.twoYear.increases[0].period} / {scenarios.twoYear.increases[1].period}
                </div>
              )}
            </div>
          )}

          {/* Copy Dollar Increases Button */}
          <div className="text-center pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="mb-2"
              onClick={() => {
                const increases = scenarios.twoYear?.increases || [];
                if (increases.length === 1) {
                  onCopyAmount(`2-Year Increases: ${formatCurrency(increases[0].dollarIncrease)}`, '2-year dollar increases');
                } else if (increases.length === 2) {
                  onCopyAmount(`2-Year Increases: ${formatCurrency(increases[0].dollarIncrease)}, ${formatCurrency(increases[1].dollarIncrease)}`, '2-year dollar increases');
                }
              }}
              title="Copy all 2-year dollar increases"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Dollar Increases
            </Button>
          </div>

          {/* Applied Rule */}
          <div className="text-center pt-3 border-t">
            <div className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Applied Rule</div>
            <div className="inline-flex flex-wrap items-center justify-center gap-2">
              {(() => {
                const rule = twoYearGuideline?.rule;
                if (!rule) return <span className="text-xs md:text-sm font-semibold">N/A</span>;
                
                if (rule.type === 'flat') {
                  return (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-xs md:text-sm font-semibold">{rule.pct}%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount(`${rule.pct}%`, '2-year rate')}
                        title="Copy 2-year rate"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                    </span>
                  );
                } else if (rule.type === 'split') {
                  return (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-xs md:text-sm font-semibold">{rule.year1_pct}%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount(`${rule.year1_pct}%`, '2-year year 1 rate')}
                        title="Copy year 1 rate"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                      <span className="text-xs md:text-sm font-semibold">/</span>
                      <span className="text-xs md:text-sm font-semibold">{rule.year2_pct_on_year1_rent}%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount(`${rule.year2_pct_on_year1_rent}%`, '2-year year 2 rate')}
                        title="Copy year 2 rate"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                    </span>
                  );
                } else if (rule.type === 'split_by_month') {
                  return (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-xs md:text-sm font-semibold">{rule.first_pct}%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount(`${rule.first_pct}%`, '2-year first period rate')}
                        title="Copy first period rate"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                      <span className="text-xs md:text-sm font-semibold">/</span>
                      <span className="text-xs md:text-sm font-semibold">{rule.remaining_months_pct}%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount(`${rule.remaining_months_pct}%`, '2-year remaining period rate')}
                        title="Copy remaining period rate"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                    </span>
                  );
                }
                return <span className="text-xs md:text-sm font-semibold">N/A</span>;
              })()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}