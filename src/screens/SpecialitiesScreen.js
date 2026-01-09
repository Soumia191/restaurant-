import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SpecialitiesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Specialities</Text>
      <Text style={styles.text}>Coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
