import React, { useState } from 'react';
import { Building2, ExternalLink } from 'lucide-react';
import RentCalculatorForm from '../components/RentCalculatorForm';
import RentCalculatorResults from '../components/RentCalculatorResults';
import { CalculationInputs, CalculationResult } from '../types/rgb';
import { calculateRentIncrease } from '../utils/rentCalculator';
import { testOrder55Specifically, runRentCalculationTests } from '../utils/testRentCalculations';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function RentCalculator() {
  const [result, setResult] = useState<{ oneYear: CalculationResult; twoYear: CalculationResult } | null>(null);
  const [inputs, setInputs] = useState<CalculationInputs | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const handleCalculate = async (calculationInputs: CalculationInputs) => {
    setIsCalculating(true);
    
    try {
      // Run validation tests in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development Mode: Running validation tests...');
        testOrder55Specifically();
        runRentCalculationTests();
      }
      
      // Simulate brief loading for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Calculate both 1-year and 2-year scenarios
      const oneYearResult = calculateRentIncrease(calculationInputs, 1);
      const twoYearResult = calculateRentIncrease(calculationInputs, 2);
      
      if (oneYearResult && twoYearResult) {
        setResult({ oneYear: oneYearResult, twoYear: twoYearResult });
        setInputs(calculationInputs);
        
        // Scroll to results
        setTimeout(() => {
          const resultsElement = document.getElementById('results');
          resultsElement?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
        toast({
          title: "Calculation complete",
          description: `Both 1-year and 2-year scenarios calculated using RGB Order #${oneYearResult.order}`,
        });
      } else {
        toast({
          title: "No applicable guideline found",
          description: "Unable to find a rent guideline for the selected lease start date.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Calculation error:", error);
      toast({
        title: "Calculation error",
        description: "An error occurred while calculating the rent increase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Logo Header */}
      <div className="bg-white py-8 sm:py-12 border-b border-border/20">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <img 
              src="/lovable-uploads/9e2195e0-6e83-40de-9b1b-aa6ee8ef1e34.png" 
              alt="NYC Landlords & Managers" 
              className="h-20 sm:h-28 md:h-32 lg:h-36 w-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-calculator-header to-calculator-header/90 text-white">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">NYC Stabilized Rent Calculator</h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-3xl leading-relaxed">
            Calculate rent-stabilized renewal increases for NYC apartments based on official 
            Rent Guidelines Board (RGB) orders from the last 10 years.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          {/* Form and Results - Responsive Layout Based on Content Width */}
          <div className="space-y-6">
            {/* Form - Always on Top */}
            <div>
              <RentCalculatorForm 
                onCalculate={handleCalculate}
                isCalculating={isCalculating}
              />
            </div>
            
            {/* Results or Quick Info - Below Form to Prevent Horizontal Scroll */}
            <div>
              {result && inputs ? (
                <div id="results">
                  <RentCalculatorResults result={result} inputs={inputs} />
                </div>
              ) : (
                <Card className="h-fit shadow-lg border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <CardContent className="p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">How It Works</h2>
                    <div className="space-y-3 sm:space-y-4 text-sm">
                      <div>
                        <h3 className="font-medium text-calculator-header mb-2">Complete Analysis</h3>
                        <ul className="space-y-1 text-muted-foreground text-xs sm:text-sm">
                          <li>• Both 1-year and 2-year scenarios calculated</li>
                          <li>• Side-by-side comparison like official renewal forms</li>
                          <li>• Split percentage increases handled automatically</li>
                          <li>• Monthly breakdown for complex lease structures</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-calculator-header mb-2">Preferential Rent</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                          If you pay less than the legal regulated rent due to a preferential rent agreement, 
                          enter both amounts to see the legal increase and your actual payment.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-calculator-header mb-2">Coverage Period</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                          This calculator covers RGB Orders #47-57 (October 2015 - September 2026). 
                          Guidelines are updated annually each October.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Additional Info Section - Now Below */}
          {result && inputs && (
            <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Important Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-sm">
                  <div>
                    <h3 className="font-medium text-calculator-header mb-2">Complete Analysis</h3>
                    <ul className="space-y-1 text-muted-foreground text-xs sm:text-sm">
                      <li>• Both 1-year and 2-year scenarios calculated</li>
                      <li>• Side-by-side comparison like official renewal forms</li>
                      <li>• Split percentage increases handled automatically</li>
                      <li>• Monthly breakdown for complex lease structures</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-calculator-header mb-2">Preferential Rent</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        If Tenant Pays less than the legal regulated rent due to a preferential rent agreement, 
                        enter both amounts to see the legal increase and their actual payment.
                      </p>
                  </div>
                  
                  <div className="sm:col-span-2 md:col-span-1">
                    <h3 className="font-medium text-calculator-header mb-2">Coverage Period</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      This calculator covers RGB Orders #47-57 (October 2015 - September 2026). 
                      Guidelines are updated annually each October.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* References */}
          <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Official Sources & References</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-sm">
                <div>
                  <h3 className="font-medium mb-2 sm:mb-3">NYC Rent Guidelines Board</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <a 
                      href="https://rentguidelinesboard.cityofnewyork.us/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors text-xs sm:text-sm break-all sm:break-normal"
                    >
                      Official RGB Website <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                    <a 
                      href="https://rentguidelinesboard.cityofnewyork.us/resources/rent-stabilized-lease-renewal/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors text-xs sm:text-sm break-all sm:break-normal"
                    >
                      Lease Renewal Guidelines <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2 sm:mb-3">NYC Housing & Community Renewal</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <a 
                      href="https://hcr.ny.gov/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors text-xs sm:text-sm break-all sm:break-normal"
                    >
                      Official HCR Website <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                    <a 
                      href="https://portal.311.nyc.gov/article/?kanumber=KA-01013" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors text-xs sm:text-sm break-all sm:break-normal"
                    >
                      NYC311 Rent Guidelines <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 mt-8 sm:mt-12 lg:mt-16">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center text-xs sm:text-sm text-muted-foreground space-y-1">
            <p>
              NYC Stabilized Rent Calculator • For educational purposes only • Not legal advice
            </p>
            <p>
              Always confirm calculations with official NYC Housing and Community Renewal (HCR) or RGB
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}