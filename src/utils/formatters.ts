export const formatCurrency = (value: number | string): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
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
