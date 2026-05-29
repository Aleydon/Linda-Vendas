import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { CategoryItem } from '@/components/CategoryItem';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { ProductCard } from '@/components/ProductCard';
import { useAppContext } from '@/context/AppContext';

export function Home(): React.JSX.Element {
  const { products, loading, categories } = useAppContext();
  const [activeCategoryId, setActiveCategoryId] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Loading />
      </View>
    );
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory =
      activeCategoryId === 'Todos' || product.category_id === activeCategoryId;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Decide which categories to show as section headers
  const displayedSections =
    activeCategoryId === 'Todos'
      ? categories.filter(cat => products.some(p => p.category_id === cat.id))
      : categories.filter(cat => cat.id === activeCategoryId);

  return (
    <View className="bg-background flex-1">
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Search Bar */}
        <View className="px-6 py-6">
          <View className="border-secondary flex-row items-center rounded-2xl border bg-white px-4 py-3 shadow-sm">
            <MaterialCommunityIcons name="magnify" size={24} color="#8C7E7E" />
            <TextInput
              placeholder="Buscar produtos..."
              placeholderTextColor="#8C7E7E"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="ml-2 flex-1 font-medium text-base"
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6 px-6"
          contentContainerStyle={{ paddingRight: 40 }}
        >
          <CategoryItem
            label="Todos"
            isActive={activeCategoryId === 'Todos'}
            onPress={() => setActiveCategoryId('Todos')}
          />
          {categories.map(category => (
            <CategoryItem
              key={category.id}
              label={category.name}
              isActive={activeCategoryId === category.id}
              onPress={() => setActiveCategoryId(category.id)}
            />
          ))}
        </ScrollView>

        <View className="px-6">
          {displayedSections.map(section => {
            const sectionProducts = filteredProducts.filter(
              p => p.category_id === section.id
            );

            // If we are filtering by a specific category and it's empty,
            // we'll show the header but the message below will handle the "empty" state.
            if (activeCategoryId === 'Todos' && sectionProducts.length === 0)
              return null;

            return (
              <View key={section.id} className="mb-6">
                <Text className="text-text-secondary mb-4 font-bold text-xs uppercase tracking-widest">
                  {section.name}
                </Text>

                {sectionProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    name={product.name}
                    price={product.price.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2
                    })}
                    stock={product.stock}
                    imageUrl={product.imageUrl}
                    outOfStock={product.outOfStock}
                  />
                ))}
              </View>
            );
          })}

          {filteredProducts.length === 0 && (
            <View className="py-20 items-center justify-center">
              <MaterialCommunityIcons
                name="package-variant"
                size={48}
                color="#D1D5DB"
              />
              <Text className="text-text-secondary mt-2 text-base">
                {activeCategoryId === 'Todos'
                  ? 'Nenhum produto cadastrado'
                  : 'Nenhum produto nesta categoria'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default Home;
