import { MaterialCommunityIcons } from '@expo/vector-icons';

export const getCategoryIcon = (
  categoryName: string
): keyof typeof MaterialCommunityIcons.glyphMap => {
  const name = categoryName.toLowerCase();
  if (
    name.includes('bebida') ||
    name.includes('suco') ||
    name.includes('refrigerante') ||
    name.includes('café') ||
    name.includes('cafe')
  )
    return 'coffee';
  if (
    name.includes('comida') ||
    name.includes('marmita') ||
    name.includes('refeição')
  )
    return 'silverware-fork-knife';
  if (name.includes('doce') || name.includes('sobremesa'))
    return 'candy-outline';
  if (name.includes('salgado') || name.includes('lanche'))
    return 'food-variant';
  if (name.includes('fruta')) return 'food-apple-outline';
  if (
    name.includes('diversos') ||
    name.includes('outro') ||
    name.includes('acessório')
  )
    return 'archive-outline';
  return 'package-variant';
};
