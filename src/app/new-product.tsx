import { Redirect } from 'expo-router';

import { ProductForm } from '@/components/ProductForm';
import { useAppContext } from '@/context/AppContext';

export function NewProduct() {
  const { addProduct, isAdmin } = useAppContext();

  if (!isAdmin) {
    return <Redirect href="/(tabs)/stock" />;
  }

  return (
    <ProductForm
      title="Novo Produto"
      onSubmit={data => {
        void addProduct(data);
      }}
    />
  );
}

export default NewProduct;
