export const formatCurrency = (value: number | string): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

/**
 * Formata um número para o padrão de moeda brasileiro SEM o símbolo R$
 */
export const formatCurrencyValue = (value: number | string): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return numericValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Formata uma string de entrada numérica para o padrão de moeda brasileiro (0,00)
 * Ideal para uso em inputs em tempo real.
 */
export const formatInputCurrency = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  if (!cleanValue) return '';

  const amount = parseInt(cleanValue, 10) / 100;
  return formatCurrencyValue(amount);
};

/**
 * Converte uma string formatada (R$ 0.000,00) de volta para um número float
 */
export const parseFormattedCurrency = (value: string): number => {
  if (!value) return 0;
  return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateLong = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateStr = d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString(
    'pt-BR',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }
  );

  if (dateStr === today) return 'Hoje';
  if (dateStr === yesterday) return 'Ontem';
  return dateStr;
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
};

export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Agora mesmo';
  if (minutes < 60) return `Há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Há ${hours} h`;
  return d.toLocaleDateString('pt-BR');
};
