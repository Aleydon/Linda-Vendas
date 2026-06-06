import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Switch, Text, TouchableOpacity, View } from 'react-native';

import { FormField } from '@/components/FormField';
import { Variation } from '@/context/AppContext';
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
  return (
    <View className="mt-4">
      <View className="flex flex-col border-t border-secondary pt-6 pb-2">
        <Text className="text-text-primary font-semibold text-base">
          VARIAÇÕES (OPCIONAL)
        </Text>
        <View className="flex flex-col">
          <View className="flex-row items-center justify-between mt-2">
            <Text>Este produto possui variações</Text>
            <Switch
              value={hasVariations}
              onValueChange={onToggleVariations}
              trackColor={{ false: '#E5E7EB', true: '#A34211' }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
          <Text className=" text-xs mt-0.5 text-text-muted">
            Ex.: sabores, marcas, tamanhos, tipos, etc...
          </Text>
        </View>
      </View>

      {hasVariations && (
        <View className="mt-6 border-t border-secondary pt-6">
          <Text className="mb-4 text-text-secondary font-medium text-sm uppercase tracking-wider">
            Lista de Variações
          </Text>
          {variations.map((variation, index) => (
            <View
              key={variation.id}
              className="border-secondary mb-4 rounded-2xl border bg-white p-4 shadow-sm"
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
                      value={variation.stock ? variation.stock.toString() : ''}
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
                  <Text className="bg-primary w-full py-2 text-center border rounded-2xl text-secondary">
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity
            onPress={onAddVariation}
            className="border-primary flex-row items-center justify-center rounded-2xl border border-dashed py-4 bg-primary/5 mt-4"
          >
            <MaterialCommunityIcons name="plus" size={24} color="#A34211" />
            <Text className="text-primary ml-2 font-bold">
              Adicionar nova variação
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
