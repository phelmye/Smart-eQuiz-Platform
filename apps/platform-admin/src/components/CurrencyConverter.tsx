import { useState, useEffect } from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';
import { formatCurrency, convertCurrency, getSupportedCurrencies, type CurrencyCode } from '@smart-equiz/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';

const STORAGE_KEY = 'platform_preferred_currency';

// Currency metadata
const CURRENCY_INFO: Record<string, { symbol: string; name: string }> = {
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  BRL: { symbol: 'R$', name: 'Brazilian Real' },
  MXN: { symbol: 'Mex$', name: 'Mexican Peso' },
  ZAR: { symbol: 'R', name: 'South African Rand' },
  NGN: { symbol: '₦', name: 'Nigerian Naira' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling' },
};

interface CurrencyConverterProps {
  amount: number; // Amount in USD cents
  baseCurrency?: CurrencyCode;
  showSymbol?: boolean;
  showConverter?: boolean;
  className?: string;
}

export function CurrencyConverter({
  amount,
  baseCurrency = 'USD',
  showSymbol = true,
  showConverter = true,
  className = '',
}: CurrencyConverterProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [convertedAmount, setConvertedAmount] = useState<number>(amount / 100);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved currency preference
    const savedCurrency = localStorage.getItem(STORAGE_KEY) as CurrencyCode;
    const supportedCurrencies = getSupportedCurrencies();
    if (savedCurrency && supportedCurrencies.includes(savedCurrency)) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  useEffect(() => {
    // Convert amount whenever currency or amount changes
    const convert = async () => {
      setIsLoading(true);
      try {
        const amountInBaseCurrency = amount / 100; // Convert cents to dollars
        const converted = await convertCurrency(
          amountInBaseCurrency,
          baseCurrency,
          selectedCurrency
        );
        setConvertedAmount(converted);
      } catch (error) {
        console.error('Currency conversion error:', error);
        setConvertedAmount(amount / 100);
      } finally {
        setIsLoading(false);
      }
    };

    convert();
  }, [amount, baseCurrency, selectedCurrency]);

  const handleCurrencyChange = (currency: CurrencyCode) => {
    setSelectedCurrency(currency);
    localStorage.setItem(STORAGE_KEY, currency);
  };

  const formatAmount = () => {
    return formatCurrency(convertedAmount, selectedCurrency, 'en-US');
  };

  if (!showConverter) {
    return (
      <span className={className}>
        {isLoading ? '...' : formatAmount()}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {showSymbol && <DollarSign className="h-4 w-4 text-gray-500" />}
        <span className="font-semibold text-lg">
          {isLoading ? 'Converting...' : formatAmount()}
        </span>
      </div>
      
      <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {getSupportedCurrencies().map((code) => {
            const info = CURRENCY_INFO[code];
            return (
              <SelectItem key={code} value={code}>
                <div className="flex items-center gap-2">
                  <span>{info?.symbol || code}</span>
                  <span>{code}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {selectedCurrency !== baseCurrency && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedCurrency(baseCurrency)}
          title="Reset to USD"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * Compact currency display (no converter UI)
 */
export function CurrencyDisplay({ amount, currency = 'USD' }: { amount: number; currency?: CurrencyCode }) {
  const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>('USD');
  const [convertedAmount, setConvertedAmount] = useState<number>(amount / 100);

  useEffect(() => {
    const savedCurrency = localStorage.getItem(STORAGE_KEY) as CurrencyCode;
    const supportedCurrencies = getSupportedCurrencies();
    if (savedCurrency && supportedCurrencies.includes(savedCurrency)) {
      setPreferredCurrency(savedCurrency);
    }
  }, []);

  useEffect(() => {
    const convert = async () => {
      try {
        const converted = await convertCurrency(
          amount / 100,
          currency,
          preferredCurrency
        );
        setConvertedAmount(converted);
      } catch (error) {
        setConvertedAmount(amount / 100);
      }
    };

    convert();
  }, [amount, currency, preferredCurrency]);

  return (
    <span>
      {formatCurrency(convertedAmount, preferredCurrency, 'en-US')}
    </span>
  );
}

/**
 * Currency selector (for forms)
 */
export function CurrencySelector({ 
  value, 
  onChange,
  className = '' 
}: { 
  value: CurrencyCode; 
  onChange: (currency: CurrencyCode) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {getSupportedCurrencies().map((code) => {
          const info = CURRENCY_INFO[code];
          return (
            <SelectItem key={code} value={code}>
              <div className="flex items-center justify-between w-full gap-4">
                <span className="flex items-center gap-2">
                  <span>{info?.symbol || code}</span>
                  <span className="font-medium">{code}</span>
                </span>
                <span className="text-sm text-gray-500">{info?.name || code}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

/**
 * Hook to get user's preferred currency
 */
export function usePreferredCurrency(): CurrencyCode {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  useEffect(() => {
    const savedCurrency = localStorage.getItem(STORAGE_KEY) as CurrencyCode;
    const supportedCurrencies = getSupportedCurrencies();
    if (savedCurrency && supportedCurrencies.includes(savedCurrency)) {
      setCurrency(savedCurrency);
    }
  }, []);

  return currency;
}
