import React from 'react';
import { CheckCircle, Copy, FileText } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ResultsHeaderProps {
  orderNumber: number;
  address?: string;
  unit?: string;
  effectivePeriod: string;
  onCopyResults: () => void;
  onPrint: () => void;
}

export default function ResultsHeader({ 
  orderNumber, 
  address, 
  unit, 
  effectivePeriod, 
  onCopyResults, 
  onPrint 
}: ResultsHeaderProps) {
  return (
    <CardHeader className="bg-gradient-to-r from-calculator-success to-calculator-success/90 text-white rounded-t-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            RGB Order #{orderNumber} - Renewal Calculation
          </CardTitle>
          {(address || unit) && (
            <div className="mt-2 text-base text-white/90 space-y-1">
              {address && <div>📍 {address}</div>}
              {unit && <div>🏠 Unit {unit}</div>}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            onClick={onCopyResults} 
            variant="outline" 
            size="sm" 
            className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm sm:text-base"
          >
            <Copy className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            Copy Results
          </Button>
          <Button 
            onClick={onPrint} 
            variant="outline" 
            size="sm" 
            className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm sm:text-base"
          >
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            Print
          </Button>
        </div>
      </div>
      <p className="text-white/90 text-sm sm:text-base mt-2 leading-relaxed">
        Effective Period: {new Date(effectivePeriod.split(' to ')[0]).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })} to {new Date(effectivePeriod.split(' to ')[1]).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>
    </CardHeader>
  );
}