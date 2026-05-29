import { ProductForm } from '@/components/ProductForm';
import { useAppContext } from '@/context/AppContext';

export function NewProduct() {
  const { addProduct } = useAppContext();

  return (
    <ProductForm
      title="Novo Produto"
      onSubmit={data => {
        addProduct(data);
      }}
    />
  );
}

export default NewProduct;
