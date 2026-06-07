import React from 'react';
import { ScrollView, View } from 'react-native';

import { Skeleton } from '@/components/Skeleton';

export function HistorySkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-grow">
      <View className="px-6 py-4">
        {/* Grand Total Summary Card */}
        <Skeleton customClass="h-28 w-full rounded-[32px] mb-8" />

        {/* Date Headers and Items */}
        {[1, 2].map(groupIndex => (
          <View key={groupIndex} className="mb-8">
            <Skeleton customClass="h-4 w-32 rounded-md mb-4" />
            <View className="gap-y-4">
              {[1, 2].map(i => (
                <View
                  key={i}
                  className="bg-white dark:bg-zinc-900 rounded-[32px] p-4 border border-secondary/20 dark:border-zinc-800 flex-row items-center justify-between shadow-sm"
                >
                  <View className="flex-row items-center">
                    <Skeleton customClass="h-10 w-10 rounded-2xl mr-4" />
                    <View className="gap-y-1.5">
                      <Skeleton customClass="h-3.5 w-16 rounded-md" />
                      <Skeleton customClass="h-3 w-12 rounded-md" />
                    </View>
                  </View>
                  <View className="items-end gap-y-1.5">
                    <Skeleton customClass="h-3 w-14 rounded-md" />
                    <Skeleton customClass="h-6 w-24 rounded-md" />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default HistorySkeleton;
