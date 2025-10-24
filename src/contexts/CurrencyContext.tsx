import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Exchange rate to USD
}

export const CURRENCIES: Record<string, Omit<Currency, 'rate'>> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
};

interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  exchangeRates: Record<string, number>;
  convert: (amount: number, fromCurrency: string, toCurrency?: string) => number;
  formatCurrency: (amount: number, fromCurrency: string, toCurrency?: string) => string;
  refreshRates: () => Promise<void>;
  lastUpdated: Date | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    return localStorage.getItem('selectedCurrency') || 'USD';
  });

  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50,
    CNY: 7.24,
    HKD: 7.83,
    SGD: 1.34,
    AUD: 1.53,
    CAD: 1.36,
    CHF: 0.88,
  });

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch exchange rates from API
  const refreshRates = async () => {
    try {
      // Using exchangerate-api.com free tier (1500 requests/month)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');

      if (response.ok) {
        const data = await response.json();
        const rates: Record<string, number> = {
          USD: 1.0,
        };

        // Map the rates for currencies we support
        Object.keys(CURRENCIES).forEach(code => {
          if (data.rates[code]) {
            rates[code] = data.rates[code];
          }
        });

        setExchangeRates(rates);
        setLastUpdated(new Date());
        localStorage.setItem('exchangeRates', JSON.stringify(rates));
        localStorage.setItem('ratesLastUpdated', new Date().toISOString());

        console.log('Exchange rates updated:', rates);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      // Use cached rates if available
      const cachedRates = localStorage.getItem('exchangeRates');
      if (cachedRates) {
        setExchangeRates(JSON.parse(cachedRates));
        const cachedDate = localStorage.getItem('ratesLastUpdated');
        if (cachedDate) {
          setLastUpdated(new Date(cachedDate));
        }
      }
    }
  };

  // Load cached rates on mount and refresh
  useEffect(() => {
    const cachedRates = localStorage.getItem('exchangeRates');
    const cachedDate = localStorage.getItem('ratesLastUpdated');

    if (cachedRates && cachedDate) {
      setExchangeRates(JSON.parse(cachedRates));
      setLastUpdated(new Date(cachedDate));

      // Check if rates are older than 24 hours
      const dayInMs = 24 * 60 * 60 * 1000;
      const now = new Date().getTime();
      const lastUpdate = new Date(cachedDate).getTime();

      if (now - lastUpdate > dayInMs) {
        refreshRates();
      }
    } else {
      refreshRates();
    }
  }, []);

  // Save selected currency to localStorage
  useEffect(() => {
    localStorage.setItem('selectedCurrency', selectedCurrency);
  }, [selectedCurrency]);

  // Convert amount from one currency to another
  const convert = (amount: number, fromCurrency: string, toCurrency?: string): number => {
    const target = toCurrency || selectedCurrency;

    if (fromCurrency === target) {
      return amount;
    }

    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[target] || 1;

    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  };

  // Format currency with proper symbol and decimals
  const formatCurrency = (amount: number, fromCurrency: string, toCurrency?: string): string => {
    const target = toCurrency || selectedCurrency;
    const convertedAmount = convert(amount, fromCurrency, target);
    const currency = CURRENCIES[target];

    if (!currency) {
      return convertedAmount.toFixed(2);
    }

    // Special formatting for JPY (no decimals)
    if (target === 'JPY') {
      return `${currency.symbol}${Math.round(convertedAmount).toLocaleString()}`;
    }

    // Standard formatting with 2 decimals
    return `${currency.symbol}${convertedAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency,
        exchangeRates,
        convert,
        formatCurrency,
        refreshRates,
        lastUpdated,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
