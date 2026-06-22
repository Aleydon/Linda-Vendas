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
  SaleStatus,
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
    addProduct: hookAddProduct,
    updateProduct: hookUpdateProduct,
    updateStock,
    resetStock,
    addStock,
    deleteProduct: hookDeleteProduct
  } = useAppProducts({
    isAdmin,
    refreshData: () => fetchData()
  });

  // 4. Sales Hook
  const {
    sales,
    setSales,
    fetchSales,
    addSale: hookAddSale,
    confirmPayment,
    fetchSalesByUser,
    fetchAllProfiles,
    updateUserRole,
    updateUserFiado,
    clearSalesHistory
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

  const showProductNotification = (
    eventType: 'INSERT' | 'UPDATE' | 'DELETE',
    productName: string
  ) => {
    if (profile?.role !== 'admin' || !profile?.notifications_enabled) return;
    if (!(profile?.products_notifications ?? true)) return;

    let title = '';
    let body = '';
    if (eventType === 'INSERT') {
      title = '🆕 Novo Produto Adicionado!';
      body = `${productName} foi adicionado ao estoque.`;
    } else if (eventType === 'UPDATE') {
      title = '✏️ Produto Editado!';
      body = `${productName} foi atualizado.`;
    } else if (eventType === 'DELETE') {
      title = '🗑️ Produto Excluído!';
      body = `${productName} foi removido do estoque.`;
    }

    Notifications.scheduleNotificationAsync({
      content: { title, body, data: { table: 'products' } },
      trigger: null
    }).catch(err => console.error('Falha ao agendar notificação:', err));
  };

  const addProduct = async (
    productData: Omit<Product, 'id' | 'outOfStock' | 'category'>
  ) => {
    await hookAddProduct(productData);
    showProductNotification('INSERT', productData.name || 'Produto');
  };

  const updateProduct = async (
    productId: string,
    updates: Partial<Omit<Product, 'id' | 'outOfStock'>>
  ) => {
    const oldProduct = products.find(p => p.id === productId);
    await hookUpdateProduct(productId, updates);
    showProductNotification('UPDATE', oldProduct?.name || 'Produto');
  };

  const deleteProduct = async (productId: string) => {
    const oldProduct = products.find(p => p.id === productId);
    await hookDeleteProduct(productId);
    showProductNotification('DELETE', oldProduct?.name || 'Produto');
  };

  const addSale = async (
    items: {
      product_id: string;
      variation_id?: string;
      quantity: number;
      unit_price: number;
    }[],
    total: number,
    userId?: string,
    status: SaleStatus = 'paid',
    customerName?: string
  ) => {
    await hookAddSale(items, total, userId, status, customerName);

    if (
      profile?.role === 'admin' &&
      profile?.notifications_enabled &&
      (profile?.sales_notifications ?? true)
    ) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Nova Venda Realizada!',
          body: `Uma nova venda de R$ ${Number(total).toFixed(2)} foi registrada.`,
          data: {}
        },
        trigger: null
      }).catch(err => console.error('Falha ao agendar notificação:', err));
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
            const newSale = payload.new as {
              id: string;
              total: number;
              user_id: string;
            };
            // Notify admin if it's not their sale
            if (
              profile?.role === 'admin' &&
              profile?.notifications_enabled &&
              (profile?.sales_notifications ?? true) &&
              newSale.user_id !== user.id
            ) {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: 'Nova Venda Realizada!',
                  body: `Uma nova venda de R$ ${Number(newSale.total).toFixed(2)} foi registrada por outro vendedor.`,
                  data: { saleId: newSale.id }
                },
                trigger: null
              }).catch(err =>
                console.error('Falha ao agendar notificação:', err)
              );
            }
            // Refresh data to show new sale in history
            void fetchData();
          }
        )
        .subscribe(status => {
          console.log('Realtime status (sales):', status);
        });
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

  // 6. Products realtime subscription and notifications
  useEffect(() => {
    if (!user) return;

    let productsSubscription: RealtimeChannel | null = null;

    const setupProductsSubscription = () => {
      if (productsSubscription) {
        supabase.removeChannel(productsSubscription);
      }

      productsSubscription = supabase
        .channel('public:products')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'products'
          },
          payload => {
            if (
              profile?.role === 'admin' &&
              profile?.notifications_enabled &&
              (profile?.products_notifications ?? true)
            ) {
              const productName =
                ((payload.new as Record<string, unknown>)?.name as string) ||
                ((payload.old as Record<string, unknown>)?.name as string) ||
                'Produto';

              let title = '';
              let body = '';

              if (payload.eventType === 'INSERT') {
                title = '🆕 Novo Produto Adicionado!';
                body = `${productName} foi adicionado ao estoque.`;
              } else if (payload.eventType === 'UPDATE') {
                title = '✏️ Produto Editado!';
                body = `${productName} foi atualizado.`;
              } else if (payload.eventType === 'DELETE') {
                title = '🗑️ Produto Excluído!';
                body = `${productName} foi removido do estoque.`;
              }

              Notifications.scheduleNotificationAsync({
                content: { title, body, data: { table: 'products' } },
                trigger: null
              }).catch(err =>
                console.error('Falha ao agendar notificação:', err)
              );
            }

            void fetchData();
          }
        )
        .subscribe(status => {
          console.log('Realtime status (products):', status);
        });
    };

    setupProductsSubscription();

    return () => {
      if (productsSubscription) {
        supabase.removeChannel(productsSubscription);
      }
    };
  }, [
    user?.id,
    profile?.role,
    profile?.notifications_enabled,
    profile?.products_notifications
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
    clearSalesHistory,
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
