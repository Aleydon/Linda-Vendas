import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Switch, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition
} from 'react-native-reanimated';

import { FormField } from '@/components/FormField';
import { useAppContext, Variation } from '@/context/AppContext';
import { formatCurrencyValue } from '@/utils/formatters';

interface VariationSectionProps {
  hasVariations: boolean;
  onToggleVariations: (value: boolean) => void;
  variations: Variation[];
  onAddVariation: () => void;
  onRemoveVariation: (id: string) => void;
  onUpdateVariation: (
    id: string,
    field: keyof Variation,
    value: string | number
  ) => void;
  onVariationPriceChange: (id: string, text: string) => void;
}

export function VariationSection({
  hasVariations,
  onToggleVariations,
  variations,
  onAddVariation,
  onRemoveVariation,
  onUpdateVariation,
  onVariationPriceChange
}: VariationSectionProps) {
  const { colorScheme } = useAppContext();

  return (
    <View className="mt-4">
      <View className="flex flex-col border-t border-secondary dark:border-zinc-800 pt-6 pb-2">
        <Text className="text-text-primary dark:text-zinc-100 font-semibold text-base">
          VARIAÇÕES (OPCIONAL)
        </Text>
        <View className="flex flex-col">
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-text-primary dark:text-zinc-300">
              Este produto possui variações
            </Text>
            <Switch
              value={hasVariations}
              onValueChange={onToggleVariations}
              trackColor={{ false: '#E5E7EB', true: '#A34211' }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
          <Text className=" text-xs mt-0.5 text-text-muted dark:text-zinc-500">
            Ex.: sabores, marcas, tamanhos, tipos, etc...
          </Text>
        </View>
      </View>

      {hasVariations && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          layout={LinearTransition}
          className="mt-6 border-t border-secondary dark:border-zinc-800 pt-6"
        >
          <Text className="mb-4 text-text-secondary dark:text-zinc-400 font-medium text-sm uppercase tracking-wider">
            Lista de Variações
          </Text>
          <Animated.View layout={LinearTransition}>
            {variations.map((variation, index) => (
              <Animated.View
                key={variation.id}
                entering={FadeInDown.duration(300)}
                exiting={FadeOut.duration(200)}
                layout={LinearTransition}
                className="border-secondary dark:border-zinc-800 mb-4 rounded-2xl border bg-white dark:bg-zinc-900 p-4 shadow-sm"
              >
                <View className="mb-4">
                  <FormField
                    label="Nome da Variação"
                    value={variation.name}
                    onChangeText={text =>
                      onUpdateVariation(variation.id, 'name', text)
                    }
                    placeholder="Ex: sabores, marcas, tamanhos, tipos..."
                  />

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <FormField
                        label="Preço"
                        value={
                          variation.price
                            ? formatCurrencyValue(variation.price)
                            : ''
                        }
                        onChangeText={text =>
                          onVariationPriceChange(variation.id, text)
                        }
                        keyboardType="numeric"
                        placeholder="0,00"
                      />
                    </View>
                    <View className="flex-1">
                      <FormField
                        label="Estoque"
                        value={
                          variation.stock ? variation.stock.toString() : ''
                        }
                        onChangeText={text =>
                          onUpdateVariation(
                            variation.id,
                            'stock',
                            parseInt(text, 10) || 0
                          )
                        }
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
                <View key={index}>
                  <TouchableOpacity
                    className="flex-row items-center justify-center w-full"
                    onPress={() => onRemoveVariation(variation.id)}
                  >
                    <View className="bg-red-500 dark:bg-red-900/40 w-full py-3 items-center justify-center rounded-2xl border border-red-600 dark:border-red-900/60">
                      <Text className="text-white dark:text-red-200 font-bold">
                        Excluir Variação
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </Animated.View>

          <TouchableOpacity
            onPress={onAddVariation}
            className="border-primary dark:border-orange-600 flex-row items-center justify-center rounded-2xl border border-dashed py-4 bg-primary/5 dark:bg-orange-500/5 mt-4"
          >
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
            />
            <Text className="text-primary dark:text-orange-400 ml-2 font-bold">
              Adicionar nova variação
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
