import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import { ProductForm } from '@/components/ProductForm';
import { useAppContext } from '@/context/AppContext';

export function EditProduct() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, updateProduct, isAdmin } = useAppContext();

  if (!isAdmin) {
    return <Redirect href="/(tabs)/stock" />;
  }

  const product = products.find(item => item.id === id);

  if (!product) {
    return (
      <View className="bg-background dark:bg-zinc-950 flex-1 items-center justify-center px-6">
        <Text className="text-text-primary dark:text-zinc-100 text-xl font-bold">
          Produto não encontrado
        </Text>
        <Text className="text-text-secondary dark:text-zinc-400 mt-2 text-center">
          Verifique se o item ainda existe e tente novamente.
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 rounded-2xl bg-primary dark:bg-orange-600 px-6 py-3"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-base">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ProductForm
      title="Editar Produto"
      initialData={product}
      onSubmit={data => {
        void updateProduct(product.id, data);
      }}
    />
  );
}

export default EditProduct;
