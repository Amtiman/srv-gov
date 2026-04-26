export const CURRENCIES = [
  { code: 'USD', symbol: '$',     label: 'USD ($)' },
  { code: 'EUR', symbol: '€',     label: 'EUR (€)' },
  { code: 'GBP', symbol: '£',     label: 'GBP (£)' },
  { code: 'XAF', symbol: 'FCFA',  label: 'XAF (FCFA)' },
  { code: 'SAR', symbol: 'ر.س',   label: 'SAR (ر.س)' },
  { code: 'MAD', symbol: 'د.م.',  label: 'MAD (د.م.)' },
  { code: 'TND', symbol: 'د.ت',   label: 'TND (د.ت)' },
  { code: 'DZD', symbol: 'د.ج',   label: 'DZD (د.ج)' },
  { code: 'AED', symbol: 'د.إ',   label: 'AED (د.إ)' },
  { code: 'QAR', symbol: 'ر.ق',   label: 'QAR (ر.ق)' },
  { code: 'EGP', symbol: 'ج.م.',  label: 'EGP (ج.م.)' },
];

const SYMBOL_MAP = Object.fromEntries(CURRENCIES.map(c => [c.code, c.symbol]));

const POSTFIX_CURRENCIES = new Set(['XAF']);

export const formatFee = (amount, currency = 'USD') => {
  const symbol = SYMBOL_MAP[currency] ?? currency;
  return POSTFIX_CURRENCIES.has(currency)
    ? `${amount} ${symbol}`
    : `${symbol}${amount}`;
};
