import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { setOrders } from '../../store/orderSlice';
import api from '../../services/api';

/**
 * Écran Historique des commandes - Client
 */
export default function OrdersHistoryScreen() {
  const { list } = useSelector((s) => s.orders);
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      // Filtrer les commandes de l'utilisateur connecté
      const userOrders = user?.id 
        ? data.filter(order => order.userId === user.id)
        : data;
      dispatch(setOrders(userOrders));
    } catch (e) {
      console.warn('Fetch orders error', e?.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return ['#ffd43b', '#ffec8c'];
      case 'EN_COURS':
        return ['#6270ff', '#7c8aff'];
      case 'LIVREE':
        return ['#51cf66', '#69db7c'];
      case 'CANCELLED':
        return ['#ff6b6b', '#ff8787'];
      default:
        return ['#9fb5ff', '#b5c9ff'];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return 'time-outline';
      case 'EN_COURS':
        return 'bicycle-outline';
      case 'LIVREE':
        return 'checkmark-circle-outline';
      case 'CANCELLED':
        return 'close-circle-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'EN_COURS':
        return 'En cours';
      case 'LIVREE':
        return 'Livrée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotal = (order) => {
    if (order.total) return order.total;
    let total = 0;
    if (order.items) {
      for (const item of order.items) {
        total += (item.dish?.price || 0) * item.qty;
      }
    }
    return total.toFixed(2);
  };

  const renderOrderItem = ({ item, index }) => {
    const orderItems = item.items || [];
    const total = calculateTotal(item);

    return (
      <Animated.View
        entering={FadeIn.delay(index * 50).duration(400)}
        style={styles.orderCard}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
        >
          <LinearGradient
            colors={['#151a2d', '#1e2440']}
            style={styles.orderGradient}
          >
            {/* Header */}
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>Commande #{item.id}</Text>
                <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
              </View>
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

            {/* Items preview */}
            {orderItems.length > 0 && (
              <View style={styles.itemsPreview}>
                <Text style={styles.itemsPreviewText} numberOfLines={2}>
                  {orderItems.slice(0, 2).map(item => item.dish?.name || `Plat #${item.dishId}`).join(', ')}
                  {orderItems.length > 2 && ` +${orderItems.length - 2} autre(s)`}
                </Text>
              </View>
            )}

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalPrice}>{total} €</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
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
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <Text style={styles.title}>Mes commandes</Text>
        <Text style={styles.subtitle}>
          {list.length} commande{list.length > 1 ? 's' : ''}
        </Text>
      </Animated.View>

      {list.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#9fb5ff" />
          <Text style={styles.emptyText}>Aucune commande</Text>
          <Text style={styles.emptySubtext}>
            Vos commandes apparaîtront ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id.toString()}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderDate: {
    color: '#9fb5ff',
    fontSize: 12,
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
  itemsPreview: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e2440',
  },
  itemsPreviewText: {
    color: '#9fb5ff',
    fontSize: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e2440',
  },
  totalLabel: {
    color: '#9fb5ff',
    fontSize: 16,
    fontWeight: '600',
  },
  totalPrice: {
    color: '#6270ff',
    fontSize: 20,
    fontWeight: '800',
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
