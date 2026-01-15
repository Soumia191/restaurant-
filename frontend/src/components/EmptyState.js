import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Composant pour afficher un état vide
 */
export default function EmptyState({ icon = '📭', title, message }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: '#9fb5ff',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
