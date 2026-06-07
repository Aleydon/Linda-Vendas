import React from 'react';
import { ScrollView, View } from 'react-native';

import { Skeleton } from '@/components/Skeleton';

export function HomeSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-grow">
      {/* Search Bar Skeleton */}
      <Skeleton customClass="h-14 w-[90%] mx-6 rounded-2xl mt-4 mb-6" />

      {/* Categories Horizontal Carousel */}
      <View className="flex-row gap-x-3 px-6 mb-6">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} customClass="h-9 w-20 rounded-full" />
        ))}
      </View>

      {/* Product List Cards */}
      <View className="px-6 gap-y-4">
        {[1, 2, 3, 4].map(i => (
          <View
            key={i}
            className="border-secondary dark:border-zinc-800 bg-surface dark:bg-zinc-900 flex-row items-center rounded-2xl border p-2"
          >
            <Skeleton customClass="h-20 w-20 rounded-xl" />
            <View className="ml-4 flex-1 gap-y-2">
              <Skeleton customClass="h-5 w-32 rounded-md" />
              <View className="flex-row justify-between items-center mt-1">
                <Skeleton customClass="h-6 w-20 rounded-md" />
                <Skeleton customClass="h-5 w-24 rounded-full" />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default HomeSkeleton;
