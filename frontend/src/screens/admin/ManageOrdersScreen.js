import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { updateOrderStatus } from '../../store/orderSlice';
import api from '../../services/api';
import Header from '../../components/Header';

/**
 * Écran Gestion des Commandes - Admin peut accepter ou refuser les commandes
 */
export default function ManageOrdersScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
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

  const handleAcceptOrder = async (orderId) => {
    setProcessingId(orderId);
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status: 'ACCEPTED' });
      dispatch(updateOrderStatus({ id: data.id, status: data.status }));
      setOrders(orders.map(order => order.id === orderId ? data : order));
      Alert.alert('Succès', 'Commande acceptée. Elle est maintenant visible par les livreurs.');
    } catch (e) {
      console.warn('Accept order error', e?.response?.data || e.message);
      Alert.alert('Erreur', e?.response?.data?.error || 'Impossible d\'accepter la commande');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectOrder = async (orderId) => {
    Alert.alert(
      'Refuser la commande',
      'Êtes-vous sûr de vouloir refuser cette commande ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(orderId);
            try {
              const { data } = await api.put(`/orders/${orderId}/status`, { status: 'CANCELLED' });
              dispatch(updateOrderStatus({ id: data.id, status: data.status }));
              setOrders(orders.map(order => order.id === orderId ? data : order));
              Alert.alert('Succès', 'Commande refusée.');
            } catch (e) {
              console.warn('Reject order error', e?.response?.data || e.message);
              Alert.alert('Erreur', e?.response?.data?.error || 'Impossible de refuser la commande');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return ['#ffd43b', '#ffec8c'];
      case 'ACCEPTED':
        return ['#51cf66', '#69db7c'];
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
      case 'ACCEPTED':
        return 'checkmark-circle-outline';
      case 'EN_COURS':
        return 'bicycle-outline';
      case 'LIVREE':
        return 'checkmark-done-circle-outline';
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
      case 'ACCEPTED':
        return 'Acceptée';
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingOrders = orders.filter(order => order.status === 'PENDING');
  const otherOrders = orders.filter(order => order.status !== 'PENDING');

  const renderOrderItem = ({ item, index }) => {
    const isProcessing = processingId === item.id;
    const canAccept = item.status === 'PENDING';

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
              <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
              {item.user && (
                <Text style={styles.orderUser}>
                  {item.user.name || item.user.email}
                </Text>
              )}
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

          {/* Items */}
          {item.items && item.items.length > 0 && (
            <View style={styles.itemsContainer}>
              <Text style={styles.itemsTitle}>Articles:</Text>
              {item.items.map((orderItem, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>
                    {orderItem.dish?.name || `Plat #${orderItem.dishId}`}
                  </Text>
                  <Text style={styles.itemQuantity}>x{orderItem.qty}</Text>
                  <Text style={styles.itemPrice}>
                    {((orderItem.dish?.price || 0) * orderItem.qty).toFixed(2)} €
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Delivery Info */}
          {item.address && (
            <View style={styles.deliveryInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={16} color="#9fb5ff" />
                <Text style={styles.infoText}>{item.address}</Text>
              </View>
              {item.phone && (
                <View style={styles.infoRow}>
                  <Ionicons name="call" size={16} color="#9fb5ff" />
                  <Text style={styles.infoText}>{item.phone}</Text>
                </View>
              )}
              {item.notes && (
                <View style={styles.infoRow}>
                  <Ionicons name="document-text" size={16} color="#9fb5ff" />
                  <Text style={styles.infoText}>{item.notes}</Text>
                </View>
              )}
            </View>
          )}

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>
              {item.total ? item.total.toFixed(2) : '0.00'} €
            </Text>
          </View>

          {/* Actions */}
          {canAccept && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptOrder(item.id)}
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
                      <Text style={styles.actionButtonText}>Accepter</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleRejectOrder(item.id)}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#ff6b6b', '#ff8787']}
                  style={styles.actionButtonGradient}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="close-circle" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Refuser</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
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
        title="Gérer les commandes" 
        subtitle={`${pendingOrders.length} en attente, ${orders.length} au total`}
        showLogout={true}
      />

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#9fb5ff" />
          <Text style={styles.emptyText}>Aucune commande</Text>
          <Text style={styles.emptySubtext}>
            Les commandes apparaîtront ici lorsqu'elles seront créées
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
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
          ListHeaderComponent={
            pendingOrders.length > 0 ? (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Commandes en attente ({pendingOrders.length})
                </Text>
              </View>
            ) : null
          }
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
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
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
    padding: 16,
  },
  orderHeader: {
    marginBottom: 12,
  },
  orderInfo: {
    marginBottom: 8,
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
    marginBottom: 4,
  },
  orderUser: {
    color: '#6270ff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  itemsContainer: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e2440',
  },
  itemsTitle: {
    color: '#9fb5ff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center',
  },
  itemName: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  itemQuantity: {
    color: '#9fb5ff',
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  itemPrice: {
    color: '#6270ff',
    fontSize: 14,
    fontWeight: '700',
  },
  deliveryInfo: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e2440',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  infoText: {
    color: '#ffffff',
    fontSize: 13,
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e2440',
    marginBottom: 12,
  },
  totalLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  totalPrice: {
    color: '#6270ff',
    fontSize: 20,
    fontWeight: '800',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  acceptButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  rejectButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
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
