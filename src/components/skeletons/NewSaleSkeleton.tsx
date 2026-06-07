import React from 'react';
import { ScrollView, View } from 'react-native';

import { Skeleton } from '@/components/Skeleton';

export function NewSaleSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-grow">
      <View className="px-6 pt-2 gap-y-2">
        <Skeleton customClass="h-7 w-36 rounded-md" />
        <Skeleton customClass="h-4 w-64 rounded-md" />
      </View>

      <Skeleton customClass="h-14 w-[90%] mx-6 rounded-2xl mt-4 mb-6" />

      {/* Categories Horizontal Carousel */}
      <View className="flex-row gap-x-3 px-6 mb-6">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} customClass="h-9 w-20 rounded-full" />
        ))}
      </View>

      {/* Sale Product List Items */}
      <View className="px-6 gap-y-4">
        {[1, 2, 3].map(i => (
          <View
            key={i}
            className="flex-row items-center border border-secondary dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 p-4 shadow-sm"
          >
            <Skeleton customClass="h-20 w-20 rounded-2xl mr-4" />
            <View className="flex-1 gap-y-2">
              <Skeleton customClass="h-5 w-32 rounded-md" />
              <Skeleton customClass="h-4 w-16 rounded-md" />
              <Skeleton customClass="h-4 w-12 rounded-md" />
            </View>
            <View className="flex-row items-center gap-x-2">
              <Skeleton customClass="h-8 w-8 rounded-xl" />
              <Skeleton customClass="h-4 w-4 rounded-md" />
              <Skeleton customClass="h-8 w-8 rounded-xl" />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
export default NewSaleSkeleton;
