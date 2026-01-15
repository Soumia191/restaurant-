import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/**
 * Composant RestaurantLayout - Affiche les tables disponibles en grille
 */
export default function RestaurantLayout({ tables, selectedTableId, onTableSelect, disabled = false }) {
  const handleTablePress = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    const isAvailable = table?.availableToday !== undefined ? table.availableToday : table?.available;
    
    if (disabled || !isAvailable) {
      return;
    }
    // Si la table est déjà sélectionnée, on la désélectionne
    if (selectedTableId === tableId) {
      onTableSelect(null);
    } else {
      onTableSelect(tableId);
    }
  };

  const renderTable = ({ item: table, index }) => {
    const isSelected = selectedTableId === table.id;
    // Utiliser availableToday si disponible, sinon available
    const isAvailable = table.availableToday !== undefined ? table.availableToday : table.available;

    return (
      <Animated.View
        entering={FadeIn.delay(index * 30).duration(300)}
        style={styles.tableContainer}
      >
        <TouchableOpacity
          onPress={() => handleTablePress(table.id)}
          disabled={disabled || !isAvailable}
          activeOpacity={0.8}
          style={styles.tableButton}
        >
          <LinearGradient
            colors={
              !isAvailable
                ? ['#3a1a1a', '#4a2525']
                : isSelected
                ? ['#6270ff', '#7c8aff']
                : ['#15321a', '#1a4020']
            }
            style={[
              styles.tableCard,
              !isAvailable && styles.tableCardOccupied,
              isSelected && styles.tableCardSelected,
            ]}
          >
            <Ionicons
              name={isSelected ? 'checkmark-circle' : isAvailable ? 'restaurant' : 'close-circle'}
              size={20}
              color="#fff"
            />
            <Text style={styles.tableName}>{table.name}</Text>
            <Text style={styles.tableSeats}>{table.seats} places</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.layoutContainer}>
        {/* Légende */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#1a4020' }]} />
            <Text style={styles.legendText}>Disponible</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4a2525' }]} />
            <Text style={styles.legendText}>Occupée</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#6270ff' }]} />
            <Text style={styles.legendText}>Sélectionnée</Text>
          </View>
        </View>

        {/* Liste des tables en grille */}
        <FlatList
          data={tables}
          renderItem={renderTable}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.tablesGrid}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  layoutContainer: {
    backgroundColor: '#151a2d',
    borderRadius: 16,
    padding: 12,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2440',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: '#9fb5ff',
    fontSize: 11,
  },
  tablesGrid: {
    paddingTop: 8,
  },
  tableContainer: {
    flex: 1,
    margin: 6,
    maxWidth: (width - 80) / 3,
  },
  tableButton: {
    width: '100%',
  },
  tableCard: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tableCardOccupied: {
    opacity: 0.6,
  },
  tableCardSelected: {
    transform: [{ scale: 1.05 }],
    shadowColor: '#6270ff',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#6270ff',
  },
  tableName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  tableSeats: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.9,
    marginTop: 2,
  },
});
