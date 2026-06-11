import {
  formatCurrency,
  formatCurrencyValue,
  formatDateLong,
  formatDateTime,
  formatInputCurrency,
  formatRelativeTime,
  parseFormattedCurrency
} from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format number to BRL currency string', () => {
      const result = formatCurrency(10.5);
      // Using regex to handle different space characters and potential environment differences
      expect(result).toMatch(/R\$\s*10,50/);
    });

    it('should format string number to BRL currency string', () => {
      const result = formatCurrency('100.5');
      expect(result).toMatch(/R\$\s*100,50/);
    });
  });

  describe('formatCurrencyValue', () => {
    it('should format number to BRL decimal string without symbol', () => {
      const result = formatCurrencyValue(1234.56);
      expect(result).toBe('1.234,56');
    });

    it('should handle zero', () => {
      const result = formatCurrencyValue(0);
      expect(result).toBe('0,00');
    });
  });

  describe('formatInputCurrency', () => {
    it('should format raw numeric string to currency format', () => {
      expect(formatInputCurrency('1050')).toBe('10,50');
      expect(formatInputCurrency('123456')).toBe('1.234,56');
    });

    it('should return empty string if input is empty', () => {
      expect(formatInputCurrency('')).toBe('');
    });
  });

  describe('parseFormattedCurrency', () => {
    it('should convert formatted string back to number', () => {
      expect(parseFormattedCurrency('1.234,56')).toBe(1234.56);
      expect(parseFormattedCurrency('10,50')).toBe(10.5);
    });

    it('should return 0 for empty string', () => {
      expect(parseFormattedCurrency('')).toBe(0);
    });
  });

  describe('formatDateTime', () => {
    it('should format date to HH:mm', () => {
      const date = new Date(2023, 0, 1, 14, 30);
      expect(formatDateTime(date)).toBe('14:30');
    });
  });

  describe('formatDateLong', () => {
    it('should return "Hoje" for today', () => {
      expect(formatDateLong(new Date())).toBe('Hoje');
    });

    it('should return "Ontem" for yesterday', () => {
      const yesterday = new Date(Date.now() - 86400000);
      expect(formatDateLong(yesterday)).toBe('Ontem');
    });

    it('should return long formatted date for other days', () => {
      const otherDate = new Date(2023, 0, 1);
      expect(formatDateLong(otherDate)).toMatch(/01 de janeiro de 2023/i);
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "Agora mesmo" for current time', () => {
      expect(formatRelativeTime(new Date())).toBe('Agora mesmo');
    });

    it('should return minutes ago', () => {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60000);
      expect(formatRelativeTime(fiveMinsAgo)).toBe('Há 5 min');
    });

    it('should return hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 3600000);
      expect(formatRelativeTime(twoHoursAgo)).toBe('Há 2 h');
    });
  });
});
