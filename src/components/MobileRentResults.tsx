import React from 'react';
import { Copy, FileText } from 'lucide-react';
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
    tenantName?: string;
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
      {/* Lease End Dates Section */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-center">Lease End Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="text-lg font-semibold text-foreground">
                {new Date(inputs.leaseStartDate.getFullYear() + 1, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                onClick={() => onCopyAmount(new Date(inputs.leaseStartDate.getFullYear() + 1, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }), '1-year lease end date')}
                title="Copy 1-year lease end date"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">1-Year Lease End</div>
          </div>
          
          <div className="text-center pt-2 border-t">
            <div className="flex items-center justify-center gap-2">
              <div className="text-lg font-semibold text-foreground">
                {new Date(inputs.leaseStartDate.getFullYear() + 2, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                onClick={() => onCopyAmount(new Date(inputs.leaseStartDate.getFullYear() + 2, inputs.leaseStartDate.getMonth(), inputs.leaseStartDate.getDate() - 1).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }), '2-year lease end date')}
                title="Copy 2-year lease end date"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">2-Year Lease End</div>
          </div>
        </CardContent>
      </Card>

      {/* Current Rent Section */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-center">Current Rent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(inputs.currentRent)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
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
              <div className="flex items-center justify-center gap-2">
                <div className="text-2xl font-bold text-calculator-info">
                  {formatCurrency(inputs.preferentialRent)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
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
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Legal Rent */}
          <div className="text-center">
            <div className="text-xs md:text-sm font-medium text-foreground mb-2">Legal Regulated Rent</div>
            {scenarios.oneYear?.increases.length === 2 ? (
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="text-xl font-semibold text-primary">
                    {formatCurrency(scenarios.oneYear.increases[0].newRent)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                    onClick={() => onCopyAmount(scenarios.oneYear.increases[0].newRent, '1-year year 1')}
                    title="Copy Year 1 amount"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xl font-bold text-primary">/</div>
                <div className="flex items-center justify-center gap-2">
                  <div className="text-xl font-semibold text-primary">
                    {formatCurrency(scenarios.oneYear.newLegalRent)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                    onClick={() => onCopyAmount(scenarios.oneYear.newLegalRent, '1-year final')}
                    title="Copy final amount"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <div className="text-2xl font-semibold text-primary">
                  {formatCurrency(scenarios.oneYear?.newLegalRent || inputs.currentRent)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                  onClick={() => onCopyAmount(scenarios.oneYear?.newLegalRent || inputs.currentRent, '1-year')}
                  title="Copy amount"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            <div className="text-sm text-foreground mt-3 space-y-2">
              {scenarios.oneYear?.increases.length === 1 
                ? (
                  <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rate:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{formatPercent(scenarios.oneYear.increases[0].percentIncrease)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                          onClick={() => onCopyAmount(`${scenarios.oneYear.increases[0].percentIncrease}%`, '1-year percentage increase')}
                          title="Copy rate"
                        >
                          <Copy className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Increase:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                          onClick={() => onCopyAmount(scenarios.oneYear.increases[0].dollarIncrease, '1-year dollar increase')}
                          title="Copy increase"
                        >
                          <Copy className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
                : scenarios.oneYear?.increases.length === 2
                ? (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-2">{scenarios.oneYear.increases[0].period}</div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-medium">{formatPercent(scenarios.oneYear.increases[0].percentIncrease)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-3 w-3 p-0"
                              onClick={() => onCopyAmount(`${scenarios.oneYear.increases[0].percentIncrease}%`, 'year 1 rate')}
                            >
                              <Copy className="h-2 w-2" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs text-muted-foreground">{formatCurrency(scenarios.oneYear.increases[0].dollarIncrease)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-3 w-3 p-0"
                              onClick={() => onCopyAmount(scenarios.oneYear.increases[0].dollarIncrease, 'year 1 increase')}
                            >
                              <Copy className="h-2 w-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-2">{scenarios.oneYear.increases[1].period}</div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-medium">{formatPercent(scenarios.oneYear.increases[1].percentIncrease)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-3 w-3 p-0"
                              onClick={() => onCopyAmount(`${scenarios.oneYear.increases[1].percentIncrease}%`, 'year 2 rate')}
                            >
                              <Copy className="h-2 w-2" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs text-muted-foreground">{formatCurrency(scenarios.oneYear.increases[1].dollarIncrease)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-3 w-3 p-0"
                              onClick={() => onCopyAmount(scenarios.oneYear.increases[1].dollarIncrease, 'year 2 increase')}
                            >
                              <Copy className="h-2 w-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
                : 'N/A'
              }
            </div>
          </div>

          {/* Preferential Rent if applicable */}
          {inputs.preferentialRent && scenarios.oneYear?.preferentialResult && (
            <div className="text-center pt-3 border-t bg-slate-50 rounded-lg p-4 mt-4">
              <div className="text-xs md:text-sm font-medium text-slate-600 mb-2">Tenant Pays (Preferential)</div>
              {scenarios.oneYear.increases.length === 2 ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-xl font-medium text-slate-700">
                      {formatCurrency(scenarios.oneYear.increases[0].newRent === inputs.preferentialRent ? inputs.preferentialRent! : (inputs.preferentialRent! * (1 + scenarios.oneYear.increases[0].percentIncrease / 100)))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                      onClick={() => onCopyAmount(scenarios.oneYear.increases[0].newRent === inputs.preferentialRent ? inputs.preferentialRent! : (inputs.preferentialRent! * (1 + scenarios.oneYear.increases[0].percentIncrease / 100)), '1-year preferential year 1')}
                      title="Copy Year 1 preferential amount"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xl font-bold text-slate-700">/</div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-xl font-medium text-slate-700">
                      {formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                      onClick={() => onCopyAmount(scenarios.oneYear.preferentialResult.newTenantPay, '1-year preferential final')}
                      title="Copy final preferential amount"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <div className="text-2xl font-medium text-slate-700">
                    {formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                    onClick={() => onCopyAmount(scenarios.oneYear.preferentialResult.newTenantPay, '1-year preferential')}
                    title="Copy preferential amount"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <div className="text-sm md:text-base text-slate-600 mt-2">
                {scenarios.oneYear?.increases.length === 1 
                  ? (
                    <span className="inline-flex items-center gap-1">
                      {formatPercent(scenarios.oneYear.increases[0].percentIncrease)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount(`${scenarios.oneYear.increases[0].percentIncrease}%`, '1-year preferential percentage increase')}
                        title="Copy percentage increase"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                      | {formatCurrency(scenarios.oneYear.preferentialResult.newTenantPay - (inputs.preferentialRent || 0))}
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
                      {formatPercent(scenarios.oneYear.increases[0].percentIncrease)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount(`${scenarios.oneYear.increases[0].percentIncrease}%`, '1-year preferential year 1 percentage increase')}
                        title="Copy year 1 percentage increase"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                      / {formatPercent(scenarios.oneYear.increases[1].percentIncrease)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => onCopyAmount(`${scenarios.oneYear.increases[1].percentIncrease}%`, '1-year preferential year 2 percentage increase')}
                        title="Copy year 2 percentage increase"
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                      | {formatCurrency(inputs.preferentialRent! * scenarios.oneYear.increases[0].percentIncrease / 100)}
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
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Legal Rent */}
          <div className="text-center">
            <div className="text-xs md:text-sm font-medium text-foreground mb-2">Legal Regulated Rent</div>
            {scenarios.twoYear?.increases.length === 2 ? (
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="text-xl font-semibold text-primary">
                    {formatCurrency(scenarios.twoYear.increases[0].newRent)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                    onClick={() => onCopyAmount(scenarios.twoYear.increases[0].newRent, '2-year year 1')}
                    title="Copy Year 1 amount"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xl font-bold text-primary">/</div>
                <div className="flex items-center justify-center gap-2">
                  <div className="text-xl font-semibold text-primary">
                    {formatCurrency(scenarios.twoYear.newLegalRent)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                    onClick={() => onCopyAmount(scenarios.twoYear.newLegalRent, '2-year final')}
                    title="Copy final amount"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <div className="text-2xl font-semibold text-primary">
                  {formatCurrency(scenarios.twoYear?.newLegalRent || inputs.currentRent)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                  onClick={() => onCopyAmount(scenarios.twoYear?.newLegalRent || inputs.currentRent, '2-year')}
                  title="Copy amount"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            <div className="text-sm text-foreground mt-3 space-y-2">
              {scenarios.twoYear?.increases.length === 1 
                ? (
                  <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rate:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{formatPercent(scenarios.twoYear.increases[0].percentIncrease)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                          onClick={() => onCopyAmount(`${scenarios.twoYear.increases[0].percentIncrease}%`, '2-year percentage increase')}
                          title="Copy rate"
                        >
                          <Copy className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Increase:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                          onClick={() => onCopyAmount(scenarios.twoYear.increases[0].dollarIncrease, '2-year dollar increase')}
                          title="Copy increase"
                        >
                          <Copy className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
                : scenarios.twoYear?.increases.length === 2
                ? (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-2">{scenarios.twoYear.increases[0].period}</div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-medium">{formatPercent(scenarios.twoYear.increases[0].percentIncrease)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-3 w-3 p-0"
                              onClick={() => onCopyAmount(`${scenarios.twoYear.increases[0].percentIncrease}%`, '2-year year 1 rate')}
                            >
                              <Copy className="h-2 w-2" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs text-muted-foreground">{formatCurrency(scenarios.twoYear.increases[0].dollarIncrease)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-3 w-3 p-0"
                              onClick={() => onCopyAmount(scenarios.twoYear.increases[0].dollarIncrease, '2-year year 1 increase')}
                            >
                              <Copy className="h-2 w-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-2">{scenarios.twoYear.increases[1].period}</div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-medium">{formatPercent(scenarios.twoYear.increases[1].percentIncrease)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-3 w-3 p-0"
                              onClick={() => onCopyAmount(`${scenarios.twoYear.increases[1].percentIncrease}%`, '2-year year 2 rate')}
                            >
                              <Copy className="h-2 w-2" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs text-muted-foreground">{formatCurrency(scenarios.twoYear.increases[1].dollarIncrease)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-3 w-3 p-0"
                              onClick={() => onCopyAmount(scenarios.twoYear.increases[1].dollarIncrease, '2-year year 2 increase')}
                            >
                              <Copy className="h-2 w-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
                : 'N/A'
              }
            </div>
          </div>

          {/* Preferential Rent if applicable */}
          {inputs.preferentialRent && scenarios.twoYear?.preferentialResult && (
            <div className="text-center pt-3 border-t bg-slate-50 rounded-lg p-4 mt-4">
              <div className="text-xs md:text-sm font-medium text-slate-600 mb-2">Tenant Pays (Preferential)</div>
              {scenarios.twoYear.increases.length === 2 ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-xl font-medium text-slate-700">
                      {formatCurrency(scenarios.twoYear.preferentialResult.year1Amount || inputs.preferentialRent!)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                      onClick={() => onCopyAmount(scenarios.twoYear.preferentialResult.year1Amount || inputs.preferentialRent!, '2-year preferential year 1')}
                      title="Copy Year 1 preferential amount"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xl font-bold text-slate-700">/</div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-xl font-medium text-slate-700">
                      {formatCurrency(scenarios.twoYear.preferentialResult.newTenantPay)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                      onClick={() => onCopyAmount(scenarios.twoYear.preferentialResult.newTenantPay, '2-year preferential final')}
                      title="Copy final preferential amount"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <div className="text-2xl font-medium text-slate-700">
                    {formatCurrency(scenarios.twoYear?.preferentialResult?.newTenantPay || inputs.preferentialRent!)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                    onClick={() => onCopyAmount(scenarios.twoYear?.preferentialResult?.newTenantPay || inputs.preferentialRent!, '2-year preferential')}
                    title="Copy preferential amount"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <div className="text-sm text-slate-600 mt-3 space-y-2">
                {scenarios.twoYear?.increases.length === 1 
                  ? (
                    <div className="bg-slate-100/50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Rate:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{formatPercent(scenarios.twoYear.increases[0].percentIncrease)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                            onClick={() => onCopyAmount(`${scenarios.twoYear.increases[0].percentIncrease}%`, '2-year preferential percentage increase')}
                            title="Copy rate"
                          >
                            <Copy className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Increase:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{formatCurrency((scenarios.twoYear?.preferentialResult?.newTenantPay || 0) - (inputs.preferentialRent || 0))}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                            onClick={() => onCopyAmount((scenarios.twoYear?.preferentialResult?.newTenantPay || 0) - (inputs.preferentialRent || 0), '2-year preferential dollar increase')}
                            title="Copy increase"
                          >
                            <Copy className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                  : scenarios.twoYear?.increases.length === 2
                  ? (
                    <div className="bg-slate-100/50 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-2">{scenarios.twoYear.increases[0].period}</div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-sm font-medium">{formatPercent(scenarios.twoYear.increases[0].percentIncrease)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-3 w-3 p-0"
                                onClick={() => onCopyAmount(`${scenarios.twoYear.increases[0].percentIncrease}%`, '2-year preferential year 1 rate')}
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-xs text-slate-500">{formatCurrency(inputs.preferentialRent! * scenarios.twoYear.increases[0].percentIncrease / 100)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-3 w-3 p-0"
                                onClick={() => onCopyAmount(inputs.preferentialRent! * scenarios.twoYear.increases[0].percentIncrease / 100, '2-year preferential year 1 increase')}
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-2">{scenarios.twoYear.increases[1].period}</div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-sm font-medium">{formatPercent(scenarios.twoYear.increases[1].percentIncrease)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-3 w-3 p-0"
                                onClick={() => onCopyAmount(`${scenarios.twoYear.increases[1].percentIncrease}%`, '2-year preferential year 2 rate')}
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-xs text-slate-500">{formatCurrency((scenarios.twoYear?.preferentialResult?.newTenantPay || 0) - (scenarios.twoYear.preferentialResult.year1Amount || inputs.preferentialRent!))}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-3 w-3 p-0"
                                onClick={() => onCopyAmount((scenarios.twoYear?.preferentialResult?.newTenantPay || 0) - (scenarios.twoYear.preferentialResult.year1Amount || inputs.preferentialRent!), '2-year preferential year 2 increase')}
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                  : 'N/A'
                }
              </div>
            </div>
          )}

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

      {/* Print Action */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <Button 
            onClick={() => {
              // Set document title for meaningful filename
              const currentTitle = document.title;
              const date = new Date().toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              }).replace(/\//g, '-');
              const addressPart = inputs.address ? `-${inputs.address.split(',')[0].replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}` : '';
              const unitPart = inputs.unit ? `-${inputs.unit.replace(/\s/g, '')}` : '';
              document.title = `NYC-Rent-Calculation-${date}${addressPart}${unitPart}-RGB${result.oneYear.order}`;
              window.print();

              // Restore original title after print
              setTimeout(() => {
                document.title = currentTitle;
              }, 1000);
            }} 
            variant="outline" 
            className="w-full bg-white border-primary text-primary hover:bg-primary hover:text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Print Results
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}