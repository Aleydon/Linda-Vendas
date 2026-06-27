import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppContext } from '@/context/AppContext';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Route icons matching original choices
const ROUTE_ICONS: Record<string, IconName> = {
  dashboard: 'view-dashboard-outline',
  index: 'store-outline',
  'new-sale': 'cart',
  stock: 'reorder-horizontal',
  history: 'history'
};

// Route labels in Portuguese matching original layout
const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Painel',
  index: 'Produtos',
  'new-sale': 'Vender',
  stock: 'Estoque',
  history: 'Histórico'
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colorScheme, sales } = useAppContext();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  // Count pending sales (fiados) to display as a badge on the History tab
  const pendingSalesCount = sales.filter(
    sale => sale.status === 'pending'
  ).length;

  // Dynamically calculate bottom spacing to prevent overlapping with system navigation bar
  const bottomInset = insets.bottom > 0 ? insets.bottom + 8 : 24;

  return (
    <>
      {/* Background mask to hide scrolling content below and behind the floating tab bar */}
      <View
        className={`absolute bottom-0 left-0 right-0 ${
          isDark ? 'bg-zinc-950' : 'bg-background'
        }`}
        style={{ height: bottomInset + 10 }} // Covers bottom safe area plus a little offset
      />
      <View
        className={`absolute left-2 right-2 h-20 rounded-full flex-row items-center justify-around px-cardSm shadow-lg  ${
          isDark
            ? 'bg-[#091118] border border-[#16232e] shadow-black/60'
            : 'bg-white border border-zinc-200 shadow-zinc-300/40'
        }`}
        style={{ bottom: bottomInset }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key
            });
          };

          const iconName = ROUTE_ICONS[route.name] || 'help-circle-outline';
          const label = ROUTE_LABELS[route.name] || route.name;

          // Custom styling based on focus and theme
          const activeBgColor = isDark ? '#c06030' : '#fdf4e9';
          const activeTextColor = isDark ? '#fdf4e9' : '#A34211';
          const inactiveTextColor = isDark ? '#ffffff' : '#8C7E7E';

          const showBadge = route.name === 'history' && pendingSalesCount > 0;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              className="flex-1 items-center justify-center py-2"
            >
              <View
                className="items-center justify-center px-3 py-1.5"
                style={{
                  minWidth: 64,
                  alignSelf: 'center',
                  borderRadius: 50,
                  backgroundColor: isFocused ? activeBgColor : 'transparent',
                  overflow: 'hidden'
                }}
              >
                <View className="relative">
                  <MaterialCommunityIcons
                    name={iconName}
                    size={24}
                    color={isFocused ? activeTextColor : inactiveTextColor}
                  />
                  {showBadge && (
                    <View
                      className={`absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full items-center justify-center ${
                        isDark ? 'bg-sky-500' : 'bg-red-500'
                      }`}
                    >
                      <Text className="text-[9px] font-bold text-white text-center leading-none">
                        {pendingSalesCount}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  className="text-[10px] font-bold mt-1 text-center"
                  style={{
                    color: isFocused
                      ? activeTextColor
                      : isDark
                        ? '#cbd5e1'
                        : inactiveTextColor
                  }}
                >
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

export function Layout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false
      }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="index" />
      <Tabs.Screen name="new-sale" />
      <Tabs.Screen name="stock" />
      <Tabs.Screen name="history" />
    </Tabs>
  );
}

export default Layout;
