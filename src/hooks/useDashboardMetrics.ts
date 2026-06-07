import { useMemo } from 'react';

import { Product, Sale } from '@/context/types';

export function useDashboardMetrics(sales: Sale[], products: Product[]) {
  const metrics = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todaySalesData = sales.filter(s => new Date(s.created_at) >= today);
    const yesterdaySalesData = sales.filter(s => {
      const date = new Date(s.created_at);
      return date >= yesterday && date < today;
    });

    const tTotalSales = todaySalesData.reduce((acc, s) => acc + s.total, 0);
    const yTotalSales = yesterdaySalesData.reduce((acc, s) => acc + s.total, 0);

    let pChange = 0;
    if (yTotalSales > 0) {
      pChange = ((tTotalSales - yTotalSales) / yTotalSales) * 100;
    } else if (tTotalSales > 0) {
      pChange = 100;
    }

    const productStats: {
      [key: string]: { name: string; quantity: number; total: number };
    } = {};
    const categoryStats: {
      [key: string]: { name: string; quantity: number; total: number };
    } = {};

    sales.forEach(sale => {
      sale.sale_items?.forEach(item => {
        const prodName = item.product?.name || 'Produto';
        const varName = item.variation?.name;
        const displayName = varName ? `${prodName} (${varName})` : prodName;
        const categoryName = item.product?.categories?.name || 'Sem Categoria';

        if (!productStats[displayName]) {
          productStats[displayName] = {
            name: displayName,
            quantity: 0,
            total: 0
          };
        }
        productStats[displayName].quantity += item.quantity;
        productStats[displayName].total +=
          item.quantity * Number(item.unit_price);

        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = {
            name: categoryName,
            quantity: 0,
            total: 0
          };
        }
        categoryStats[categoryName].quantity += item.quantity;
        categoryStats[categoryName].total +=
          item.quantity * Number(item.unit_price);
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const topCategories = Object.values(categoryStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);

    const lowStockItems = products
      .filter(p => p.stock <= 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);

    const salesChartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = d.getMonth();
      const date = d.getDate();

      const dayName = d
        .toLocaleDateString('pt-BR', { weekday: 'short' })
        .replace('.', '');
      const capitalizedDayName =
        dayName.charAt(0).toUpperCase() + dayName.slice(1);
      const dateString = `${String(date).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}`;

      const daySales = sales.filter(s => {
        const sDate = new Date(s.created_at);
        return (
          sDate.getFullYear() === year &&
          sDate.getMonth() === month &&
          sDate.getDate() === date
        );
      });

      const total = daySales.reduce((acc, s) => acc + s.total, 0);
      salesChartData.push({
        dayName: capitalizedDayName,
        dateString,
        total
      });
    }

    return {
      todaySales: tTotalSales,
      percentageChange: pChange,
      topProducts,
      topCategories,
      lowStockItems,
      salesChartData
    };
  }, [sales, products]);

  return metrics;
}
export default useDashboardMetrics;
