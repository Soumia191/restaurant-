import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { updateOrderStatus, setOrders } from '../../store/orderSlice';
import api from '../../services/api';
import Header from '../../components/Header';

/**
 * Écran Commandes Livreur - Gérer les commandes en livraison
 */
export default function DeliveryOrdersScreen() {
  const { list } = useSelector((s) => s.orders);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [dispatch]);

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      dispatch(setOrders(data));
    } catch (e) {
      console.warn('Fetch orders error', e?.response?.data || e.message);
      Alert.alert('Erreur', 'Impossible de charger les commandes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const updateStatus = async (orderId, status) => {
    setProcessingId(orderId);
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status });
      dispatch(updateOrderStatus({ id: data.id, status: data.status }));
      Alert.alert('Succès', `Commande marquée comme ${status === 'EN_COURS' ? 'en cours' : 'livrée'}`);
    } catch (e) {
      console.warn('Update order error', e?.response?.data || e.message);
      Alert.alert('Erreur', 'Impossible de mettre à jour la commande');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return ['#51cf66', '#69db7c'];
      case 'EN_COURS':
        return ['#6270ff', '#7c8aff'];
      case 'LIVREE':
        return ['#51cf66', '#69db7c'];
      default:
        return ['#9fb5ff', '#b5c9ff'];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'checkmark-circle-outline';
      case 'EN_COURS':
        return 'bicycle-outline';
      case 'LIVREE':
        return 'checkmark-done-circle-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'Disponible';
      case 'EN_COURS':
        return 'En cours';
      case 'LIVREE':
        return 'Livrée';
      default:
        return status;
    }
  };

  // Calculer les commandes disponibles (acceptées par l'admin)
  const availableOrders = list.filter(order => order.status === 'ACCEPTED');
  const pendingCount = availableOrders.length;

  const renderOrderItem = ({ item, index }) => {
    const isProcessing = processingId === item.id;
    const canUpdate = item.status !== 'LIVREE';
    
    // Vérifier que item.items existe avant d'utiliser .map()
    const orderItems = item.items || [];

    return (
      <Animated.View
        entering={FadeIn.delay(index * 50).duration(400)}
        style={styles.orderCard}
      >
        <LinearGradient
          colors={['#151a2d', '#1e2440']}
          style={styles.orderGradient}
        >
          {/* Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>Commande #{item.id}</Text>
              <View style={styles.statusBadge}>
                <LinearGradient
                  colors={getStatusColor(item.status)}
                  style={styles.statusBadgeGradient}
                >
                  <Ionicons
                    name={getStatusIcon(item.status)}
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.statusBadgeText}>
                    {getStatusLabel(item.status)}
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Items */}
          {orderItems.length > 0 && (
            <View style={styles.itemsContainer}>
              <Text style={styles.itemsTitle}>Articles:</Text>
              {orderItems.map((orderItem, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>
                    {orderItem.dish?.name || `Plat #${orderItem.dishId}`}
                  </Text>
                  <Text style={styles.itemQuantity}>x{orderItem.qty}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          {canUpdate && (
            <View style={styles.actionsContainer}>
              {item.status === 'ACCEPTED' && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => updateStatus(item.id, 'EN_COURS')}
                  disabled={isProcessing}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#6270ff', '#7c8aff']}
                    style={styles.actionButtonGradient}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="bicycle" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Prendre en charge</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {item.status === 'EN_COURS' && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => updateStatus(item.id, 'LIVREE')}
                  disabled={isProcessing}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#51cf66', '#69db7c']}
                    style={styles.actionButtonGradient}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Marquer comme livrée</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6270ff" />
        <Text style={styles.loadingText}>Chargement des commandes...</Text>
      </View>
    );
  }

  return (
            <View style={styles.container}>
              <Header 
                title="Commandes de livraison" 
                subtitle={`${pendingCount} commande${pendingCount > 1 ? 's' : ''} disponible${pendingCount > 1 ? 's' : ''}`}
              />

      {list.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#9fb5ff" />
          <Text style={styles.emptyText}>Aucune commande</Text>
          <Text style={styles.emptySubtext}>
            Les commandes apparaîtront ici lorsqu'elles seront créées
          </Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(i) => i.id.toString()}
          renderItem={renderOrderItem}
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
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  orderCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  orderGradient: {
    padding: 20,
  },
  orderHeader: {
    marginBottom: 16,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadge: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  statusBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  itemsContainer: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e2440',
  },
  itemsTitle: {
    color: '#9fb5ff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  itemQuantity: {
    color: '#9fb5ff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
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
