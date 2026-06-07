import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop
} from 'react-native-svg';

import { formatCurrency } from '@/utils/formatters';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ChartDataItem {
  dayName: string;
  dateString: string;
  total: number;
}

interface SalesChartProps {
  data: ChartDataItem[];
  percentageChange: number;
}

export function SalesChart({ data, percentageChange }: SalesChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(data.length - 1);

  // SVG dimensions
  const screenWidth = Dimensions.get('window').width;
  const paddingHorizontal = 24;
  const cardPadding = 24; // Padding interno do card
  const chartWidth = screenWidth - paddingHorizontal * 2 - cardPadding * 2;
  const chartHeight = 130;

  const paddingTop = 15;
  const paddingBottom = 15;
  const paddingLeft = 10;
  const paddingRight = 10;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  // Reanimated values for entry animation
  const lineProgress = useSharedValue(1); // 1 = hidden, 0 = fully drawn
  const areaOpacity = useSharedValue(0);
  const pointsScale = useSharedValue(0);

  useEffect(() => {
    lineProgress.value = 1;
    areaOpacity.value = 0;
    pointsScale.value = 0;

    lineProgress.value = withTiming(0, { duration: 1000 });
    areaOpacity.value = withDelay(400, withTiming(0.25, { duration: 800 }));
    pointsScale.value = withDelay(800, withTiming(1, { duration: 500 }));
  }, [data]);

  // Set default selected index to today (last item) if data changes
  useEffect(() => {
    if (data.length > 0) {
      setSelectedIndex(data.length - 1);
    }
  }, [data]);

  if (!data || data.length === 0) {
    return null;
  }

  const todaySales = data[data.length - 1].total;

  // Theme logic based on faturamento
  const getTheme = () => {
    if (todaySales === 0) {
      // Sem vendas hoje: Tom terroso neutro escuro / Cinza
      return {
        bg: 'bg-[#3A3232] dark:bg-zinc-800 shadow-zinc-950/20',
        textMuted: 'text-zinc-300/60',
        textLabel: 'text-zinc-400',
        badgeBg: 'bg-white/10',
        badgeText: 'text-zinc-300',
        grid: 'rgba(255, 255, 255, 0.05)',
        accent: '#d4d4d8'
      };
    }
    if (percentageChange < 0) {
      // Vendas hoje <= ontem: Laranja Terracota (cor primária)
      return {
        bg: 'bg-[#A34211] dark:bg-[#803108] shadow-orange-950/30',
        textMuted: 'text-orange-200/60',
        textLabel: 'text-orange-300/80',
        badgeBg: 'bg-white/10',
        badgeText: 'text-orange-200',
        grid: 'rgba(255, 255, 255, 0.08)',
        accent: '#ffedd5'
      };
    }
    // Vendas hoje > ontem: Verde Esmeralda (sucesso)
    return {
      bg: 'bg-[#065F46] dark:bg-[#043e2e] shadow-emerald-950/30',
      textMuted: 'text-emerald-200/60',
      textLabel: 'text-emerald-300/80',
      badgeBg: 'bg-white/10',
      badgeText: 'text-emerald-200',
      grid: 'rgba(255, 255, 255, 0.08)',
      accent: '#d1fae5'
    };
  };

  const theme = getTheme();
  const maxVal = Math.max(...data.map(d => d.total), 100);

  // Calculate coordinates
  const points = data.map((d, i) => {
    const x = paddingLeft + i * (graphWidth / (data.length - 1));
    const y = chartHeight - paddingBottom - (d.total / maxVal) * graphHeight;
    return { x, y, ...d };
  });

  // Build the path for the line
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Build the path for the filled area under the line
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`;

  const handlePointPress = async (index: number) => {
    setSelectedIndex(index);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignora erro do haptics se não houver suporte
    }
  };

  const lineAnimatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: lineProgress.value * 800
    };
  });

  const areaAnimatedStyle = useAnimatedProps(() => {
    return {
      opacity: areaOpacity.value
    };
  });

  const selectedPoint = points[selectedIndex];
  const isTodaySelected = selectedIndex === data.length - 1;

  return (
    <View className={`rounded-[32px] p-6 shadow-xl mb-8 ${theme.bg}`}>
      {/* Header Info */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text
            className={`font-bold text-xs uppercase tracking-widest ${theme.textLabel}`}
          >
            {isTodaySelected ? 'Faturamento de Hoje' : 'Faturamento'}
          </Text>
          <Text className="text-white font-extrabold text-4xl mt-1 tracking-tight">
            {selectedPoint
              ? formatCurrency(selectedPoint.total)
              : formatCurrency(0)}
          </Text>

          <View className="flex-row items-center mt-2">
            {isTodaySelected ? (
              <>
                <View
                  className={`flex-row items-center px-2 py-0.5 rounded-lg ${theme.badgeBg}`}
                >
                  {todaySales > 0 && (
                    <MaterialCommunityIcons
                      name={percentageChange >= 0 ? 'arrow-up' : 'arrow-down'}
                      size={12}
                      color={percentageChange >= 0 ? '#34d399' : '#f87171'}
                    />
                  )}
                  <Text
                    className={`font-bold text-[10px] ${todaySales > 0 ? '' : 'ml-0'} ${theme.badgeText}`}
                  >
                    {todaySales > 0
                      ? `${Math.abs(percentageChange).toFixed(0)}%`
                      : 'Sem vendas'}
                  </Text>
                </View>
                <Text
                  className={`ml-2.5 text-xs font-medium ${theme.textMuted}`}
                >
                  {todaySales > 0 ? 'em relação a ontem' : 'registradas hoje'}
                </Text>
              </>
            ) : (
              <Text className={`text-xs font-semibold ${theme.textMuted}`}>
                {selectedPoint.dayName}, {selectedPoint.dateString}
              </Text>
            )}
          </View>
        </View>

        <View className="bg-white/15 p-2.5 rounded-2xl">
          <MaterialCommunityIcons
            name={todaySales === 0 ? 'wallet-plus-outline' : 'wallet-outline'}
            size={22}
            color="#ffffff"
          />
        </View>
      </View>

      {/* SVG Chart */}
      <View className="items-center justify-center relative my-2">
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#ffffff" stopOpacity={0.35} />
              <Stop offset="1" stopColor="#ffffff" stopOpacity={0.0} />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = paddingTop + ratio * graphHeight;
            return (
              <Path
                key={index}
                d={`M ${paddingLeft} ${y} L ${chartWidth - paddingRight} ${y}`}
                stroke={theme.grid}
                strokeWidth={1}
              />
            );
          })}

          {/* Vertical indicator line for selected day */}
          {selectedPoint && (
            <Path
              d={`M ${selectedPoint.x} ${paddingTop} L ${selectedPoint.x} ${chartHeight - paddingBottom}`}
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          )}

          {/* Filled Area under line */}
          <AnimatedPath
            d={areaPath}
            fill="url(#chartGrad)"
            animatedProps={areaAnimatedStyle}
          />

          {/* Line Chart */}
          <AnimatedPath
            d={linePath}
            stroke="#ffffff"
            strokeWidth={3}
            fill="none"
            strokeDasharray={800}
            animatedProps={lineAnimatedProps}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points circles */}
          {points.map((p, i) => {
            const isSelected = i === selectedIndex;
            return (
              <AnimatedCircle
                key={i}
                cx={p.x}
                cy={p.y}
                r={isSelected ? 5.5 : 3.5}
                fill={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.3)'}
                stroke="#ffffff"
                strokeWidth={isSelected ? 3 : 0}
                opacity={pointsScale.value}
              />
            );
          })}

          {/* Transparent click areas for easier selection */}
          {points.map((p, i) => {
            const colWidth = graphWidth / (data.length - 1);
            const clickX = p.x - colWidth / 2;
            return (
              <Rect
                key={i}
                x={clickX}
                y={0}
                width={colWidth}
                height={chartHeight}
                fill="transparent"
                onPress={() => void handlePointPress(i)}
              />
            );
          })}
        </Svg>
      </View>

      {/* X Axis Labels */}
      <View className="flex-row justify-between mt-2 px-1">
        {data.map((d, i) => {
          const isSelected = i === selectedIndex;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => void handlePointPress(i)}
              activeOpacity={0.7}
              className="items-center flex-1"
            >
              <Text
                className={`text-[10px] font-bold ${
                  isSelected ? 'text-white font-extrabold' : theme.textMuted
                }`}
              >
                {d.dayName}
              </Text>
              <Text
                className={`text-[8px] mt-0.5 ${
                  isSelected ? 'text-white font-bold' : theme.textMuted
                } opacity-60`}
              >
                {d.dateString.split('/')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default SalesChart;
