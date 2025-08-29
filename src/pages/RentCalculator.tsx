import React, { useState } from 'react';
import { Building2, ExternalLink } from 'lucide-react';
import RentCalculatorForm from '../components/RentCalculatorForm';
import RentCalculatorResults from '../components/RentCalculatorResults';
import { CalculationInputs, CalculationResult } from '../types/rgb';
import { calculateRentIncrease } from '../utils/rentCalculator';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function RentCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [inputs, setInputs] = useState<CalculationInputs | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const handleCalculate = async (calculationInputs: CalculationInputs) => {
    setIsCalculating(true);
    
    try {
      // Simulate brief loading for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const calculationResult = calculateRentIncrease(calculationInputs);
      
      if (calculationResult) {
        setResult(calculationResult);
        setInputs(calculationInputs);
        
        // Scroll to results
        setTimeout(() => {
          const resultsElement = document.getElementById('results');
          resultsElement?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
        toast({
          title: "Calculation complete",
          description: `Rent increase calculated using RGB Order #${calculationResult.order}`,
        });
      } else {
        toast({
          title: "No applicable guideline found",
          description: "Unable to find a rent guideline for the selected lease start date.",
          variant: "destructive",
        });
      }
    } catch (error) {
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
      {/* Header */}
      <header className="bg-gradient-to-r from-calculator-header to-calculator-header/90 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-8 w-8" />
            <h1 className="text-3xl font-bold">NYC Stabilized Rent Calculator</h1>
          </div>
          <p className="text-xl text-white/90 max-w-3xl">
            Calculate rent-stabilized renewal increases for NYC apartments based on official 
            Rent Guidelines Board (RGB) orders from the last 10 years.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Form */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <RentCalculatorForm 
                onCalculate={handleCalculate}
                isCalculating={isCalculating}
              />
            </div>
            
            {/* Quick Info */}
            <div className="lg:col-span-2">
              <Card className="h-fit shadow-lg border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">How It Works</h2>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h3 className="font-medium text-calculator-header mb-2">Supported Lease Types</h3>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• One-year lease renewals</li>
                        <li>• Two-year lease renewals</li>
                        <li>• Split percentage increases (different rates per year)</li>
                        <li>• Monthly split increases (different rates by month)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-calculator-header mb-2">Preferential Rent</h3>
                      <p className="text-muted-foreground">
                        If you pay less than the legal regulated rent due to a preferential rent agreement, 
                        enter both amounts to see the legal increase and your actual payment.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-calculator-header mb-2">Coverage Period</h3>
                      <p className="text-muted-foreground">
                        This calculator covers RGB Orders #47-56 (October 2015 - September 2025). 
                        Guidelines are updated annually each October.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Results */}
          {result && inputs && (
            <div id="results">
              <RentCalculatorResults result={result} inputs={inputs} />
            </div>
          )}

          {/* References */}
          <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Official Sources & References</h2>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h3 className="font-medium mb-3">NYC Rent Guidelines Board</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <a 
                      href="https://rentguidelinesboard.cityofnewyork.us/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      Official RGB Website <ExternalLink className="h-3 w-3" />
                    </a>
                    <a 
                      href="https://rentguidelinesboard.cityofnewyork.us/resources/rent-stabilized-lease-renewal/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      Lease Renewal Guidelines <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">NYC Housing & Community Renewal</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <a 
                      href="https://hcr.ny.gov/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      Official HCR Website <ExternalLink className="h-3 w-3" />
                    </a>
                    <a 
                      href="https://portal.311.nyc.gov/article/?kanumber=KA-01013" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      NYC311 Rent Guidelines <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              NYC Stabilized Rent Calculator • For educational purposes only • Not legal advice
            </p>
            <p className="mt-1">
              Always confirm calculations with official NYC Housing and Community Renewal (HCR) or RGB
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}