import { useState } from 'react';

import { Category } from '@/context/types';
import { api } from '@/services/api';

interface UseAppCategoriesProps {
  isAdmin: boolean;
  refreshData: () => Promise<void>;
}

export function useAppCategories({
  isAdmin,
  refreshData
}: UseAppCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async (): Promise<void> => {
    try {
      const data = await api.fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addCategory = async (name: string): Promise<void> => {
    if (!isAdmin) throw new Error('Unauthorized');
    try {
      await api.addCategory(name);
      await refreshData();
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    if (!isAdmin) throw new Error('Unauthorized');
    try {
      await api.deleteCategory(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const reorderCategories = async (
    newCategories: Category[]
  ): Promise<void> => {
    if (!isAdmin) throw new Error('Unauthorized');
    try {
      // Optimistic update
      setCategories(newCategories);

      const updates = newCategories.map((cat, index) => ({
        id: cat.id,
        display_order: index
      }));

      await api.updateCategoryOrder(updates);
    } catch (error) {
      console.error('Error reordering categories:', error);
      // Revert on error
      await fetchCategories();
      throw error;
    }
  };

  return {
    categories,
    setCategories,
    fetchCategories,
    addCategory,
    deleteCategory,
    reorderCategories
  };
}
