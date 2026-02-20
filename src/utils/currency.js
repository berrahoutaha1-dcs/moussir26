/**
 * Currency utilities for Commercial Management System
 * Handles formatting and conversion between currencies
 */

// Exchange rates (mock data - in real app, these would come from an API)
export const EXCHANGE_RATES = {
  DZD: 1, // Base currency
  USD: 0.0074, // 1 DZD = 0.0074 USD (approximate)
  EUR: 0.0068, // 1 DZD = 0.0068 EUR (approximate)
};

/**
 * Formats a number as currency based on the specified currency type
 */
export const formatCurrency = (
  amount,
  currency = 'DZD',
  locale = 'fr-DZ'
) => {
  const formatters = {
    DZD: new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }),
    USD: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }),
    EUR: new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }),
  };

  // Fallback formatting for DZD if not supported by the browser
  if (currency === 'DZD') {
    try {
      return formatters.DZD.format(amount);
    } catch {
      // Fallback for browsers that don't support DZD currency
      return `${amount.toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })} DZD`;
    }
  }

  return formatters[currency].format(amount);
};

/**
 * Converts amount from one currency to another
 */
export const convertCurrency = (
  amount,
  fromCurrency,
  toCurrency
) => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to DZD first (base currency)
  const amountInDZD = fromCurrency === 'DZD' 
    ? amount 
    : amount / EXCHANGE_RATES[fromCurrency];
  
  // Convert from DZD to target currency
  return toCurrency === 'DZD' 
    ? amountInDZD 
    : amountInDZD * EXCHANGE_RATES[toCurrency];
};

/**
 * Parses a currency string and returns the numeric value
 */
export const parseCurrency = (currencyString) => {
  // Remove currency symbols and convert to number
  const cleanString = currencyString
    .replace(/[^\d,.-]/g, '') // Remove all non-numeric characters except comma, period, and minus
    .replace(/,/g, ''); // Remove thousands separators
  
  return parseFloat(cleanString) || 0;
};

/**
 * Gets currency symbol for display
 */
export const getCurrencySymbol = (currency) => {
  const symbols = {
    DZD: 'د.ج',
    USD: '$',
    EUR: '€',
  };
  
  return symbols[currency] || 'د.ج';
};

/**
 * Gets short currency format (e.g., "2.5M DZD" instead of "2,500,000 DZD")
 */
export const formatCurrencyShort = (
  amount,
  currency = 'DZD'
) => {
  const symbol = getCurrencySymbol(currency);
  
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ${currency}`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K ${currency}`;
  }
  
  return `${amount.toLocaleString()} ${symbol}`;
};

