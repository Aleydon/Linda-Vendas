import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useAppContext } from '@/context/AppContext';

export function Layout() {
  const { colorScheme } = useAppContext();

  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#fb923c' : '#A34211',
        tabBarInactiveTintColor: isDark ? '#71717a' : '#8C7E7E',
        tabBarStyle: {
          backgroundColor: isDark ? '#09090b' : '#FFFBF7',
          borderTopColor: isDark ? '#18181b' : '#F5EBE0',
          height: 80,
          paddingBottom: 20
        },
        headerShown: false
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Painel',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="view-dashboard-outline"
              size={size}
              color={color}
            />
          )
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Produtos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="store-outline"
              size={size}
              color={color}
            />
          )
        }}
      />
      <Tabs.Screen
        name="new-sale"
        options={{
          title: 'Vender',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cart" size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          title: 'Estoque',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="reorder-horizontal"
              size={size}
              color={color}
            />
          )
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" size={size} color={color} />
          )
        }}
      />
    </Tabs>
  );
}

export default Layout;
