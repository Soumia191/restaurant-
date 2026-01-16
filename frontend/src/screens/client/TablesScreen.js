import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { setTables } from '../../store/tableSlice';
import api from '../../services/api';

/**
 * Écran Tables - Affiche les tables disponibles en temps réel
 */
export default function TablesScreen() {
  const dispatch = useDispatch();
  const tables = useSelector((s) => s.tables.list);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTables();
  }, [dispatch]);

  const loadTables = async () => {
    try {
      const { data } = await api.get('/tables');
      dispatch(setTables(data));
    } catch (e) {
      console.warn('Fetch tables error', e?.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTables();
  };

  const availableCount = tables.filter(t => t.available).length;
  const totalCount = tables.length;

  const renderTableItem = ({ item, index }) => (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(400)}
      style={styles.tableCard}
    >
      <LinearGradient
        colors={item.available ? ['#15321a', '#1a4020'] : ['#3a1a1a', '#4a2525']}
        style={styles.tableGradient}
      >
        <View style={styles.tableContent}>
          <View style={styles.tableLeft}>
            <View style={[styles.statusIndicator, item.available ? styles.statusAvailable : styles.statusOccupied]} />
            <View style={styles.tableInfo}>
              <Text style={styles.tableName}>{item.name}</Text>
              <Text style={styles.tableId}>Table #{item.id}</Text>
            </View>
          </View>
          <View style={styles.tableRight}>
            {item.available ? (
              <>
                <Ionicons name="checkmark-circle" size={32} color="#7cff9f" />
                <Text style={styles.statusTextAvailable}>Disponible</Text>
              </>
            ) : (
              <>
                <Ionicons name="close-circle" size={32} color="#ff7c7c" />
                <Text style={styles.statusTextOccupied}>Occupée</Text>
              </>
            )}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6270ff" />
        <Text style={styles.loadingText}>Chargement des tables...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <Text style={styles.title}>Tables</Text>
        <Text style={styles.subtitle}>
          {availableCount} sur {totalCount} table{totalCount > 1 ? 's' : ''} disponible{availableCount > 1 ? 's' : ''}
        </Text>
      </Animated.View>

      {tables.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="grid-outline" size={64} color="#9fb5ff" />
          <Text style={styles.emptyText}>Aucune table</Text>
          <Text style={styles.emptySubtext}>
            Les tables n'ont pas encore été configurées
          </Text>
        </View>
      ) : (
        <FlatList
          data={tables}
          keyExtractor={(t) => t.id.toString()}
          renderItem={renderTableItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#6270ff"
              colors={['#6270ff']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f1a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0b0f1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9fb5ff',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9fb5ff',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  tableCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tableGradient: {
    padding: 20,
  },
  tableContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  statusAvailable: {
    backgroundColor: '#7cff9f',
    shadowColor: '#7cff9f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  statusOccupied: {
    backgroundColor: '#ff7c7c',
    shadowColor: '#ff7c7c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  tableInfo: {
    flex: 1,
  },
  tableName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  tableId: {
    color: '#9fb5ff',
    fontSize: 14,
  },
  tableRight: {
    alignItems: 'center',
    marginLeft: 16,
  },
  statusTextAvailable: {
    color: '#7cff9f',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  statusTextOccupied: {
    color: '#ff7c7c',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#9fb5ff',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
