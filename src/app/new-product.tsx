import { Redirect } from 'expo-router';

import { MultipleProductsForm } from '@/components/MultipleProductsForm';
import { useAppContext } from '@/context/AppContext';
import { Product } from '@/context/types';

export function NewProduct() {
  const { addProduct, isAdmin } = useAppContext();

  if (!isAdmin) {
    return <Redirect href="/(tabs)/stock" />;
  }

  const handleSaveAll = async (
    productsList: Omit<Product, 'id' | 'outOfStock' | 'category'>[]
  ) => {
    // Save sequentially to avoid connection race conditions
    for (const prod of productsList) {
      await addProduct(prod);
    }
  };

  return (
    <MultipleProductsForm title="Novos Produtos" onSubmit={handleSaveAll} />
  );
}

export default NewProduct;
