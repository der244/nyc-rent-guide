import React, { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalculationInputs } from '../types/rgb';

interface RentCalculatorFormProps {
  onCalculate: (inputs: CalculationInputs) => void;
  isCalculating?: boolean;
}

export default function RentCalculatorForm({ onCalculate, isCalculating }: RentCalculatorFormProps) {
  const [leaseStartDate, setLeaseStartDate] = useState<Date>(new Date());
  const [leaseTerm, setLeaseTerm] = useState<"1" | "2">("1");
  const [currentRent, setCurrentRent] = useState<string>("");
  const [preferentialRent, setPreferentialRent] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndSubmit = () => {
    const newErrors: Record<string, string> = {};

    // Validate current rent
    const rentAmount = parseFloat(currentRent.replace(/[^0-9.]/g, ''));
    if (!currentRent || isNaN(rentAmount) || rentAmount <= 0) {
      newErrors.currentRent = 'Please enter a valid rent amount greater than $0';
    }

    // Validate preferential rent if provided
    let prefAmount: number | undefined;
    if (preferentialRent) {
      prefAmount = parseFloat(preferentialRent.replace(/[^0-9.]/g, ''));
      if (isNaN(prefAmount) || prefAmount <= 0) {
        newErrors.preferentialRent = 'Please enter a valid preferential rent amount greater than $0';
      } else if (prefAmount > rentAmount) {
        newErrors.preferentialRent = 'Preferential rent cannot be higher than legal regulated rent';
      }
    }

    // Validate lease start date
    if (!leaseStartDate) {
      newErrors.leaseStartDate = 'Please select a lease start date';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onCalculate({
        leaseStartDate,
        leaseTerm: parseInt(leaseTerm) as 1 | 2,
        currentRent: rentAmount,
        preferentialRent: prefAmount,
      });
    }
  };

  const formatCurrencyInput = (value: string): string => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    if (!numericValue) return '';
    const number = parseFloat(numericValue);
    if (isNaN(number)) return '';
    return number.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const handleCurrentRentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setCurrentRent(formatted);
    if (errors.currentRent) {
      setErrors(prev => ({ ...prev, currentRent: '' }));
    }
  };

  const handlePreferentialRentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setPreferentialRent(formatted);
    if (errors.preferentialRent) {
      setErrors(prev => ({ ...prev, preferentialRent: '' }));
    }
  };

  return (
    <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
      <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-lg">
        <CardTitle className="text-xl font-semibold">Lease Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Lease Start Date */}
        <div className="space-y-2">
          <Label htmlFor="lease-start" className="text-sm font-medium">
            Lease Start Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="lease-start"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !leaseStartDate && "text-muted-foreground",
                  errors.leaseStartDate && "border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {leaseStartDate ? format(leaseStartDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={leaseStartDate}
                onSelect={(date) => {
                  setLeaseStartDate(date || new Date());
                  if (errors.leaseStartDate) {
                    setErrors(prev => ({ ...prev, leaseStartDate: '' }));
                  }
                }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {errors.leaseStartDate && (
            <p className="text-sm text-destructive">{errors.leaseStartDate}</p>
          )}
        </div>

        {/* Lease Term */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Lease Term</Label>
          <RadioGroup
            value={leaseTerm}
            onValueChange={(value) => setLeaseTerm(value as "1" | "2")}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="one-year" />
              <Label htmlFor="one-year" className="font-normal">1 Year</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="two-year" />
              <Label htmlFor="two-year" className="font-normal">2 Years</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Current Legal Regulated Rent */}
        <div className="space-y-2">
          <Label htmlFor="current-rent" className="text-sm font-medium">
            Current Legal Regulated Rent
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="current-rent"
              value={currentRent}
              onChange={handleCurrentRentChange}
              placeholder="2,000.00"
              className={cn(
                "pl-8",
                errors.currentRent && "border-destructive"
              )}
            />
          </div>
          {errors.currentRent && (
            <p className="text-sm text-destructive">{errors.currentRent}</p>
          )}
        </div>

        {/* Preferential Rent (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="preferential-rent" className="text-sm font-medium">
            Preferential Rent <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="preferential-rent"
              value={preferentialRent}
              onChange={handlePreferentialRentChange}
              placeholder="1,800.00"
              className={cn(
                "pl-8",
                errors.preferentialRent && "border-destructive"
              )}
            />
          </div>
          {errors.preferentialRent && (
            <p className="text-sm text-destructive">{errors.preferentialRent}</p>
          )}
          <p className="text-xs text-muted-foreground">
            If you pay less than the legal regulated rent due to a preferential rent agreement
          </p>
        </div>

        {/* Calculate Button */}
        <Button 
          onClick={validateAndSubmit}
          disabled={isCalculating}
          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary font-medium"
          size="lg"
        >
          {isCalculating ? 'Calculating...' : 'Calculate Rent Increase'}
        </Button>
      </CardContent>
    </Card>
  );
}