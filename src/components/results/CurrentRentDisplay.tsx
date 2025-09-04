import React from 'react';
import { formatCurrency } from '@/utils/rentCalculator';

interface CurrentRentDisplayProps {
  currentRent: number;
  preferentialRent?: number;
}

export default function CurrentRentDisplay({ currentRent, preferentialRent }: CurrentRentDisplayProps) {
  return (
    <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg p-4 sm:p-6 border border-border/50 min-h-[120px] flex flex-col justify-center items-center text-center">
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
        {preferentialRent 
          ? `${formatCurrency(currentRent)} / ${formatCurrency(preferentialRent)}`
          : formatCurrency(currentRent)
        }
      </div>
      <div className="text-sm sm:text-base text-muted-foreground">
        {preferentialRent 
          ? "Legal / Preferential Rent (Tenant Currently Pays)"
          : "Legal Regulated Rent"
        }
      </div>
    </div>
  );
}