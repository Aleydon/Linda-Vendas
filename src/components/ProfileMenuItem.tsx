import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ProfileMenuItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconBgColor: string;
  iconColor: string;
  title: string;
  description?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

export function ProfileMenuItem({
  icon,
  iconBgColor,
  iconColor,
  title,
  description,
  onPress,
  rightElement
}: ProfileMenuItemProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <View className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-secondary dark:border-zinc-800 overflow-hidden mb-4">
      <Container
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        className="flex-row items-center justify-between p-4"
      >
        <View className="flex-row items-center flex-1">
          <View
            className={`w-10 h-10 rounded-xl items-center justify-center ${iconBgColor}`}
          >
            <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
          </View>
          <View className="ml-3 flex-1 mr-2">
            <Text className="text-text-primary dark:text-zinc-100 font-bold text-base">
              {title}
            </Text>
            {description && (
              <Text className="text-text-secondary dark:text-zinc-400 text-xs mt-0.5">
                {description}
              </Text>
            )}
          </View>
        </View>

        {rightElement ??
          (onPress ? (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#BDB2B2"
            />
          ) : null)}
      </Container>
    </View>
  );
}
export default ProfileMenuItem;
