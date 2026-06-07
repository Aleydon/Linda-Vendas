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

import { useAppContext } from '@/context/AppContext';
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
}

export function SalesChart({ data }: SalesChartProps) {
  const { colorScheme } = useAppContext();
  const [selectedIndex, setSelectedIndex] = useState<number>(data.length - 1);

  // SVG dimensions
  const screenWidth = Dimensions.get('window').width;
  const paddingHorizontal = 24;
  const chartWidth = screenWidth - paddingHorizontal * 2 - 24; // Padding card lateral
  const chartHeight = 150;

  const paddingTop = 20;
  const paddingBottom = 20;
  const paddingLeft = 10;
  const paddingRight = 10;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  // Reanimated values for entry animation
  const lineProgress = useSharedValue(1); // 1 = hidden, 0 = fully drawn
  const areaOpacity = useSharedValue(0);
  const pointsScale = useSharedValue(0);

  useEffect(() => {
    // Reset values on mount
    lineProgress.value = 1;
    areaOpacity.value = 0;
    pointsScale.value = 0;

    // Trigger animations
    lineProgress.value = withTiming(0, { duration: 1000 });
    areaOpacity.value = withDelay(400, withTiming(0.15, { duration: 800 }));
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
  const primaryColor = colorScheme === 'dark' ? '#fb923c' : '#A34211';
  const gridColor =
    colorScheme === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.04)';

  return (
    <View className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-secondary/20 dark:border-zinc-800 shadow-sm mb-8">
      {/* Header Info */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-text-secondary dark:text-zinc-400 font-bold text-xs uppercase tracking-wider">
            Desempenho de Vendas
          </Text>
          <Text className="text-text-primary dark:text-zinc-100 font-extrabold text-2xl mt-1">
            {selectedPoint
              ? formatCurrency(selectedPoint.total)
              : formatCurrency(0)}
          </Text>
          <Text className="text-text-secondary dark:text-zinc-500 text-xs mt-0.5">
            {selectedPoint
              ? `${selectedPoint.dayName}, ${selectedPoint.dateString}`
              : 'Nenhum dia selecionado'}
          </Text>
        </View>

        <View className="bg-secondary/40 dark:bg-zinc-800 p-2.5 rounded-2xl">
          <MaterialCommunityIcons
            name="trending-up"
            size={22}
            color={primaryColor}
          />
        </View>
      </View>

      {/* SVG Chart */}
      <View className="items-center justify-center relative">
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={primaryColor} stopOpacity={0.8} />
              <Stop offset="1" stopColor={primaryColor} stopOpacity={0.0} />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = paddingTop + ratio * graphHeight;
            return (
              <Path
                key={index}
                d={`M ${paddingLeft} ${y} L ${chartWidth - paddingRight} ${y}`}
                stroke={gridColor}
                strokeWidth={1}
              />
            );
          })}

          {/* Vertical indicator line for selected day */}
          {selectedPoint && (
            <Path
              d={`M ${selectedPoint.x} ${paddingTop} L ${selectedPoint.x} ${chartHeight - paddingBottom}`}
              stroke={primaryColor}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              opacity={0.6}
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
            stroke={primaryColor}
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
                r={isSelected ? 6 : 4}
                fill={
                  isSelected
                    ? primaryColor
                    : colorScheme === 'dark'
                      ? '#18181b'
                      : '#ffffff'
                }
                stroke={primaryColor}
                strokeWidth={isSelected ? 3 : 2}
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
      <View className="flex-row justify-between mt-3 px-1">
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
                  isSelected
                    ? 'text-primary dark:text-orange-400 font-extrabold'
                    : 'text-text-muted dark:text-zinc-500'
                }`}
              >
                {d.dayName}
              </Text>
              <Text
                className={`text-[8px] mt-0.5 ${
                  isSelected
                    ? 'text-primary/80 dark:text-orange-400/80 font-bold'
                    : 'text-text-muted/60 dark:text-zinc-600'
                }`}
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
