import AsyncStorage from '@react-native-async-storage/async-storage';
import { RealtimeChannel } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import { useColorScheme } from 'nativewind';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { useAppAuth } from '@/hooks/useAppAuth';
import { useAppCategories } from '@/hooks/useAppCategories';
import { useAppProducts } from '@/hooks/useAppProducts';
import { useAppSales } from '@/hooks/useAppSales';
import { supabase } from '@/lib/supabase';

import {
  AppContextType,
  Category,
  DBProduct,
  DBVariation,
  Product,
  Profile,
  Sale,
  SaleItem,
  UserRole,
  Variation
} from './types';

export type {
  AppContextType,
  Category,
  DBProduct,
  DBVariation,
  Product,
  Profile,
  Sale,
  SaleItem,
  UserRole,
  Variation
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({
  children
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load saved theme or default to light on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme_preference');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setColorScheme(savedTheme);
        } else {
          setColorScheme('light');
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        setColorScheme('light');
      }
    };
    void loadTheme();
  }, [setColorScheme]);

  const toggleColorScheme = async (): Promise<void> => {
    const newScheme = colorScheme === 'dark' ? 'light' : 'dark';
    try {
      setColorScheme(newScheme);
      await AsyncStorage.setItem('theme_preference', newScheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // 1. Auth Hook
  const { user, profile, isAdmin, signInWithGoogle, signOut, updateProfile } =
    useAppAuth({
      onLogin: () => {
        void fetchData();
      },
      onLogout: () => {
        setProducts([]);
        setCategories([]);
        setSales([]);
        setLoading(false);
        setInitialLoading(false);
      }
    });

  // 2. Categories Hook
  const {
    categories,
    setCategories,
    fetchCategories,
    addCategory,
    deleteCategory,
    reorderCategories
  } = useAppCategories({
    isAdmin,
    refreshData: () => fetchData()
  });

  // 3. Products Hook
  const {
    products,
    setProducts,
    fetchProducts,
    addProduct,
    updateProduct,
    updateStock,
    resetStock,
    addStock,
    deleteProduct
  } = useAppProducts({
    isAdmin,
    refreshData: () => fetchData()
  });

  // 4. Sales Hook
  const {
    sales,
    setSales,
    fetchSales,
    addSale,
    confirmPayment,
    fetchSalesByUser,
    fetchAllProfiles,
    updateUserRole,
    updateUserFiado
  } = useAppSales({
    isAdmin,
    user,
    refreshData: () => fetchData(),
    setLoading
  });

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchProducts(), fetchSales()]);
    } catch (error) {
      console.error('Unexpected error in fetchData:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // 5. Sales realtime subscription and notifications
  useEffect(() => {
    if (!user) return;

    let salesSubscription: RealtimeChannel | null = null;

    const setupSalesSubscription = () => {
      if (salesSubscription) {
        supabase.removeChannel(salesSubscription);
      }

      salesSubscription = supabase
        .channel('public:sales')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'sales'
          },
          payload => {
            const newSale = payload.new;
            // Notify admin if it's not their sale
            if (
              profile?.role === 'admin' &&
              profile?.notifications_enabled &&
              profile?.sales_notifications &&
              newSale.user_id !== user.id
            ) {
              void Notifications.scheduleNotificationAsync({
                content: {
                  title: 'Nova Venda Realizada!',
                  body: `Uma nova venda de R$ ${Number(newSale.total).toFixed(2)} foi registrada por outro vendedor.`,
                  data: { saleId: newSale.id }
                },
                trigger: null
              });
            }
            // Refresh data to show new sale in history
            void fetchData();
          }
        )
        .subscribe();
    };

    setupSalesSubscription();

    return () => {
      if (salesSubscription) {
        supabase.removeChannel(salesSubscription);
      }
    };
  }, [
    user?.id,
    profile?.role,
    profile?.notifications_enabled,
    profile?.sales_notifications
  ]);

  const contextValue: AppContextType = {
    products,
    sales,
    categories,
    loading,
    initialLoading,
    user,
    profile,
    isAdmin,
    signInWithGoogle,
    signOut,
    updateStock,
    resetStock,
    addStock,
    updateProduct,
    addProduct,
    deleteProduct,
    addSale,
    confirmPayment,
    addCategory,
    deleteCategory,
    reorderCategories,
    updateProfile,
    fetchSalesByUser,
    fetchAllProfiles,
    updateUserRole,
    updateUserFiado,
    refreshData: fetchData,
    colorScheme: colorScheme ?? 'light',
    toggleColorScheme
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
