import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  LinearTransition
} from 'react-native-reanimated';

import { CategoryItem } from '@/components/CategoryItem';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { HomeSkeleton } from '@/components/skeletons/HomeSkeleton';
import { useAppContext } from '@/context/AppContext';
import { useFocusAnimation } from '@/hooks/useFocusAnimation';
import { formatCurrencyValue } from '@/utils/formatters';

export function Home(): React.JSX.Element {
  const { products, loading, categories, colorScheme } = useAppContext();
  const [activeCategoryId, setActiveCategoryId] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const focusAnimatedStyle = useFocusAnimation();

  if (loading) {
    return (
      <View className="bg-background dark:bg-zinc-950 flex-1">
        <Header />
        <HomeSkeleton />
      </View>
    );
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory =
      activeCategoryId === 'Todos' || product.category_id === activeCategoryId;

    const lowerQuery = searchQuery.toLowerCase();
    const matchesName = product.name.toLowerCase().includes(lowerQuery);

    const matchesVariations = product.variations?.some(v =>
      v.name.toLowerCase().includes(lowerQuery)
    );

    return matchesCategory && (matchesName || matchesVariations);
  });

  // Decide which categories to show as section headers
  const displayedSections =
    activeCategoryId === 'Todos'
      ? categories.filter(cat => products.some(p => p.category_id === cat.id))
      : categories.filter(cat => cat.id === activeCategoryId);

  return (
    <View className="bg-background dark:bg-zinc-950 flex-1">
      <Header />

      <Animated.View style={focusAnimatedStyle} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {/* Search Bar */}
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

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

          <View className="p-card">
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
                  <Text className="text-text-secondary dark:text-zinc-500 mb-4 mx-2 font-bold text-xs uppercase tracking-widest">
                    {section.name}
                  </Text>

                  <Animated.View layout={LinearTransition} className="gap-y-2 ">
                    {sectionProducts.map((product, index) => (
                      <Animated.View
                        key={product.id}
                        entering={FadeInDown.delay(index * 30).duration(300)}
                        layout={LinearTransition}
                      >
                        <ProductCard
                          name={product.name}
                          description={product.description}
                          price={formatCurrencyValue(product.price)}
                          stock={product.stock}
                          imageUrl={product.imageUrl}
                          outOfStock={product.outOfStock}
                          has_variations={product.has_variations}
                          variations={product.variations}
                        />
                      </Animated.View>
                    ))}
                  </Animated.View>
                </View>
              );
            })}

            {filteredProducts.length === 0 && (
              <View className="py-20 items-center justify-center">
                <MaterialCommunityIcons
                  name="package-variant"
                  size={48}
                  color={colorScheme === 'dark' ? '#3f3f46' : '#D1D5DB'}
                />
                <Text className="text-text-secondary dark:text-zinc-500 mt-2 text-base">
                  {activeCategoryId === 'Todos'
                    ? 'Nenhum produto cadastrado'
                    : 'Nenhum produto nesta categoria'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

export default Home;
