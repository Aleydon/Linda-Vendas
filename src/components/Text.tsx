import { Text } from 'react-native';

interface TextComponentProps {
  children: React.ReactNode;
}

export function TextComponent({ children }: TextComponentProps) {
  return <Text className="font-bold text-2xl">{children}</Text>;
}
