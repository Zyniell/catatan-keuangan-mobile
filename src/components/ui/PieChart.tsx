import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { formatRupiah } from '../../utils/currency';

export interface PieChartSlice {
  key: string;
  label: string;
  value: number;
  color: string;
  prefix?: string;
}

interface PieChartProps {
  data: PieChartSlice[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
  centerValueColor?: string;
  showLegend?: boolean;
}

export function PieChart({
  data,
  size = 180,
  strokeWidth = 24,
  centerLabel,
  centerValue,
  centerValueColor,
  showLegend = true,
}: PieChartProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const total = data.reduce((acc, item) => acc + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulated = 0;

  return (
    <View style={styles.container}>
      {/* Area Donut Chart */}
      <View style={[styles.chartWrapper, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            {/* Lingkaran Jalur Dasar */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={theme.surfaceSubtle}
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Potongan Donut */}
            {total > 0 &&
              data.map((slice) => {
                if (slice.value <= 0) return null;

                const strokeDash = (slice.value / total) * circumference;
                const offset = -accumulated;
                accumulated += strokeDash;

                return (
                  <Circle
                    key={slice.key}
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={slice.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                    strokeDashoffset={offset}
                    fill="transparent"
                    strokeLinecap="butt"
                  />
                );
              })}
          </G>
        </Svg>

        {/* Teks di Bagian Tengah Donut */}
        <View style={[styles.centerOverlay, { width: size - strokeWidth * 2, height: size - strokeWidth * 2 }]}>
          {centerLabel && (
            <Text style={[styles.centerLabel, { color: theme.textSecondary }]} numberOfLines={1}>
              {centerLabel}
            </Text>
          )}
          {centerValue && (
            <Text
              style={[
                styles.centerValue,
                { color: centerValueColor || theme.text },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {centerValue}
            </Text>
          )}
          {total === 0 && (
            <Text style={[styles.noDataText, { color: theme.textMuted }]}>
              Belum ada data
            </Text>
          )}
        </View>
      </View>

      {/* Legenda Komponen di Bawah Donut */}
      {showLegend && (
        <View style={styles.legendContainer}>
          {data.map((slice) => {
            const percentage = total > 0 ? (slice.value / total) * 100 : 0;
            return (
              <View
                key={slice.key}
                style={[
                  styles.legendItem,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.legendLeft}>
                  <View style={[styles.colorDot, { backgroundColor: slice.color }]} />
                  <Text style={[styles.legendLabel, { color: theme.text }]}>
                    {slice.label}
                  </Text>
                  <View style={[styles.percentBadge, { backgroundColor: `${slice.color}20` }]}>
                    <Text style={[styles.percentText, { color: slice.color }]}>
                      {percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>

                <Text style={[styles.legendValue, { color: slice.color }]}>
                  {slice.prefix || ''}{formatRupiah(slice.value)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.two,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: Spacing.two,
  },
  centerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  centerLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
    textAlign: 'center',
  },
  centerValue: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  noDataText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  legendContainer: {
    width: '100%',
    marginTop: Spacing.three,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  percentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '700',
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '800',
  },
});
