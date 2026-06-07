import React from 'react';
import { ScrollView, View } from 'react-native';

import { Skeleton } from '@/components/Skeleton';

export function DashboardSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-grow">
      <View className="px-6 py-4">
        {/* Main Card: Faturamento */}
        <Skeleton customClass="h-44 w-full rounded-[32px] mb-8" />

        {/* Top 5 Products Section */}
        <View className="mb-8">
          <View className="flex-row justify-between mb-4">
            <Skeleton customClass="h-6 w-36 rounded-md" />
            <Skeleton customClass="h-5 w-16 rounded-md" />
          </View>
          <View className="bg-white dark:bg-zinc-900 rounded-[32px] p-2 border border-secondary/20 dark:border-zinc-800">
            {[1, 2, 3].map(i => (
              <View
                key={i}
                className="flex-row items-center p-4 border-b border-secondary/5 dark:border-zinc-800 last:border-b-0"
              >
                <Skeleton customClass="h-10 w-10 rounded-2xl mr-4" />
                <View className="flex-1 gap-y-1.5">
                  <Skeleton customClass="h-4 w-32 rounded-md" />
                  <Skeleton customClass="h-3 w-20 rounded-md" />
                </View>
                <Skeleton customClass="h-4 w-14 rounded-md" />
              </View>
            ))}
          </View>
        </View>

        {/* Categories Section */}
        <View className="mb-8">
          <Skeleton customClass="h-6 w-48 rounded-md mb-4" />
          <View className="flex-row flex-wrap gap-4">
            {[1, 2, 3, 4].map(i => (
              <View
                key={i}
                className="bg-white dark:bg-zinc-900 p-5 rounded-[28px] border border-secondary/20 dark:border-zinc-800 w-[47%] gap-y-3"
              >
                <Skeleton customClass="h-10 w-10 rounded-2xl" />
                <Skeleton customClass="h-4 w-20 rounded-md" />
                <Skeleton customClass="h-5 w-16 rounded-md" />
                <Skeleton customClass="h-3 w-12 rounded-md" />
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
export default DashboardSkeleton;
