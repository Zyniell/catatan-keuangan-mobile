import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: number;
  containerSize?: number;
  style?: ViewStyle;
}

export function CategoryIcon({
  icon,
  color,
  size = 22,
  containerSize = 44,
  style,
}: CategoryIconProps) {
  // Gunakan nama ionicon atau fallback ke circle jika tidak valid
  const iconName = (icon as keyof typeof Ionicons.glyphMap) || 'pricetag-outline';

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          backgroundColor: `${color}18`, // Opasitas lembut ~10%
        },
        style,
      ]}
    >
      <Ionicons name={iconName} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
