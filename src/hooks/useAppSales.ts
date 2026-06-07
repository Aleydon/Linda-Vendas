import { User } from '@supabase/supabase-js';
import { useState } from 'react';

import { Profile, Sale, UserRole } from '@/context/types';
import { api } from '@/services/api';

interface UseAppSalesProps {
  isAdmin: boolean;
  user: User | null;
  refreshData: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export function useAppSales({
  isAdmin,
  user,
  refreshData,
  setLoading
}: UseAppSalesProps) {
  const [sales, setSales] = useState<Sale[]>([]);

  const fetchSales = async (): Promise<void> => {
    try {
      const data = await api.fetchSales();
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const addSale = async (
    items: {
      product_id: string;
      variation_id?: string;
      quantity: number;
      unit_price: number;
    }[],
    total: number,
    userId?: string
  ): Promise<void> => {
    try {
      setLoading(true);
      const sellerId = userId || user?.id;
      await api.addSale(items, total, sellerId);
      await refreshData();
    } catch (error) {
      console.error('Error adding sale:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesByUser = async (userId: string): Promise<Sale[]> => {
    try {
      return await api.fetchSalesByUser(userId);
    } catch (error) {
      console.error('Error fetching sales by user:', error);
      return [];
    }
  };

  const fetchAllProfiles = async (): Promise<Profile[]> => {
    if (!isAdmin) throw new Error('Unauthorized');
    try {
      return await api.fetchAllProfiles();
    } catch (error) {
      console.error('Error fetching all profiles:', error);
      return [];
    }
  };

  const updateUserRole = async (
    userId: string,
    role: UserRole
  ): Promise<void> => {
    if (!isAdmin) throw new Error('Unauthorized');
    if (userId === user?.id) {
      throw new Error('Você não pode alterar sua própria role.');
    }
    try {
      await api.updateUserRole(userId, role);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  return {
    sales,
    setSales,
    fetchSales,
    addSale,
    fetchSalesByUser,
    fetchAllProfiles,
    updateUserRole
  };
}
