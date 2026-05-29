import { User } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { api } from '@/services/api';

import { AppContextType, Category, Product, Profile, Sale } from './types';

WebBrowser.maybeCompleteAuthSession();

export * from './types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({
  children
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const isAdmin = profile?.role === 'admin';

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [categoriesData, productsData, salesData] = await Promise.all([
        api.fetchCategories(),
        api.fetchProducts(),
        api.fetchSales()
      ]);

      setCategories(categoriesData);
      setProducts(productsData);
      setSales(salesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        void fetchData();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        void fetchData();
      } else {
        setProfile(null);
        setProducts([]);
        setSales([]);
        setCategories([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'linda-vendas'
      });

      console.log('Redirect URL configurada:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        console.log('Auth Result Type:', result.type);

        if (result.type === 'success' && result.url) {
          const urlObj = new URL(result.url);

          const hashParams = new URLSearchParams(urlObj.hash.substring(1));
          const queryParams = new URLSearchParams(urlObj.search);

          const access_token =
            hashParams.get('access_token') || queryParams.get('access_token');
          const refresh_token =
            hashParams.get('refresh_token') || queryParams.get('refresh_token');

          if (access_token && refresh_token) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token
            });

            if (sessionError) throw sessionError;
            console.log('Login efetuado com sucesso!');
          } else {
            console.error(
              'Tokens não encontrados na URL de retorno. URL recebida:',
              result.url
            );
          }
        }
      }
    } catch (error) {
      console.error('Erro ao fazer login com o Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const addProduct = async (
    product: Omit<Product, 'id' | 'outOfStock' | 'category'>
  ): Promise<void> => {
    if (!isAdmin) throw new Error('Unauthorized');
    try {
      await api.addProduct(product);
      await fetchData();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const updateProduct = async (
    productId: string,
    updates: Partial<Omit<Product, 'id' | 'outOfStock'>>
  ): Promise<void> => {
    if (!isAdmin) throw new Error('Unauthorized');
    try {
      await api.updateProduct(productId, updates);
      await fetchData();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const updateStock = async (
    productId: string,
    delta: number
  ): Promise<void> => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStock = Math.max(0, product.stock + delta);
    await updateProduct(productId, { stock: newStock });
  };

  const resetStock = async (productId: string): Promise<void> => {
    await updateProduct(productId, { stock: 0 });
  };

  const addStock = async (productId: string, amount: number): Promise<void> => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    await api.updateProduct(productId, { stock: product.stock + amount });
    await fetchData();
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    if (!isAdmin) throw new Error('Unauthorized');
    try {
      await api.deleteProduct(productId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const addSale = async (
    items: { product_id: string; quantity: number; unit_price: number }[],
    total: number
  ): Promise<void> => {
    try {
      setLoading(true);
      await api.addSale(items, total);
      await fetchData();
    } catch (error) {
      console.error('Error adding sale:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string): Promise<void> => {
    if (!isAdmin) throw new Error('Unauthorized');
    try {
      await api.addCategory(name);
      await fetchData();
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    if (!isAdmin) throw new Error('Unauthorized');
    try {
      await api.deleteCategory(id);
      await fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        sales,
        categories,
        loading,
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
        addCategory,
        deleteCategory,
        refreshData: fetchData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
