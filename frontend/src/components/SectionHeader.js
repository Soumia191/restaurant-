import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Composant Header de section avec gradient
 */
export default function SectionHeader({ title, subtitle, rightComponent }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#151a2d', 'transparent']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.left}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {rightComponent && <View style={styles.right}>{rightComponent}</View>}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 3,
  },
  subtitle: {
    color: '#9fb5ff',
    fontSize: 12,
  },
  right: {
    marginLeft: 16,
  },
});
