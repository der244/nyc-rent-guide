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
import { DollarSplash } from '@/components/ui/dollar-splash';
import { cn } from '@/lib/utils';
import { CalculationInputs } from '../types/rgb';

interface RentCalculatorFormProps {
  onCalculate: (inputs: CalculationInputs) => void;
  isCalculating?: boolean;
}

export default function RentCalculatorForm({ onCalculate, isCalculating }: RentCalculatorFormProps) {
  const [leaseStartDate, setLeaseStartDate] = useState<Date>(new Date());
  const [dateInputValue, setDateInputValue] = useState<string>(format(new Date(), 'MM/dd/yyyy'));
  
  const [currentRent, setCurrentRent] = useState<string>("");
  const [preferentialRent, setPreferentialRent] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [unit, setUnit] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSplash, setShowSplash] = useState<boolean>(false);

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
      setShowSplash(true);
      setTimeout(() => {
        onCalculate({
          leaseStartDate,
          currentRent: rentAmount,
          preferentialRent: prefAmount,
          address: address.trim() || undefined,
          unit: unit.trim() || undefined,
        });
      }, 300);
    }
  };

  const formatCurrencyInput = (value: string): string => {
    // Remove everything except digits and decimal point
    let numericValue = value.replace(/[^0-9.]/g, '');
    
    // Handle multiple decimal points - keep only the first one
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      numericValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      numericValue = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    if (!numericValue || numericValue === '.') return '';
    
    // If it ends with a decimal point, preserve it for user experience
    if (numericValue.endsWith('.')) {
      const number = parseFloat(numericValue.slice(0, -1));
      if (isNaN(number)) return '';
      return number.toLocaleString('en-US') + '.';
    }
    
    const number = parseFloat(numericValue);
    if (isNaN(number)) return '';
    
    // Use appropriate decimal places based on input
    const decimalPlaces = parts.length === 2 ? parts[1].length : 0;
    return number.toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces > 0 ? decimalPlaces : 0,
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

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Auto-format with slashes
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5, 9);
    }
    
    setDateInputValue(value);
    
    // Clear existing date error when user starts typing
    if (errors.leaseStartDate) {
      setErrors(prev => ({ ...prev, leaseStartDate: '' }));
    }
    
    // Try to parse the date when format is complete
    if (value.length === 10) {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate.getTime())) {
        setLeaseStartDate(parsedDate);
      }
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setLeaseStartDate(date);
      setDateInputValue(format(date, 'MM/dd/yyyy'));
      if (errors.leaseStartDate) {
        setErrors(prev => ({ ...prev, leaseStartDate: '' }));
      }
    }
  };

  return (
    <>
      <DollarSplash 
        isVisible={showSplash} 
        onComplete={() => setShowSplash(false)} 
      />
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
          <div className="relative">
            <Input
              id="lease-start"
              type="text"
              value={dateInputValue}
              onChange={handleDateInputChange}
              className={cn(
                "pr-10",
                errors.leaseStartDate && "border-destructive"
              )}
              placeholder="MM/dd/yyyy"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={leaseStartDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          {errors.leaseStartDate && (
            <p className="text-sm text-destructive">{errors.leaseStartDate}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Enter date manually (MM/dd/yyyy) or click the calendar icon
          </p>
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

        {/* Address (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Property Address <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main Street, New York, NY 10001"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Include address for reference in printed calculations
          </p>
        </div>

        {/* Unit (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="unit" className="text-sm font-medium">
            Unit Number <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Input
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Apt 4B"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Apartment or unit identifier
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
    </>
  );
}