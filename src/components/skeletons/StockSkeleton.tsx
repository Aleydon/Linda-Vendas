import React from 'react';
import { ScrollView, View } from 'react-native';

import { Skeleton } from '@/components/Skeleton';

export function StockSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-grow">
      <View className="px-6 py-6">
        <View className="mb-6 gap-y-2">
          <Skeleton customClass="h-7 w-48 rounded-md" />
          <Skeleton customClass="h-4 w-72 rounded-md" />
        </View>

        <Skeleton customClass="h-14 w-full rounded-2xl mb-6" />

        <View className="gap-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <View
              key={i}
              className="border-secondary dark:border-zinc-800 rounded-2xl border bg-white dark:bg-zinc-900 p-5 flex-row items-center justify-between shadow-sm"
            >
              <View className="flex-grow gap-y-2">
                <Skeleton customClass="h-5 w-40 rounded-md" />
                <Skeleton customClass="h-4 w-28 rounded-md" />
              </View>
              <Skeleton customClass="h-6 w-16 rounded-full" />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
export default StockSkeleton;
