import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { updateOrderStatus } from '../../store/orderSlice';
import Button from '../../components/Button';

/**
 * Écran Détails de commande - Suivi en temps réel
 */
export default function OrderDetailsScreen({ route }) {
  const { orderId } = route.params;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadOrder();
    // Polling pour le suivi en temps réel (toutes les 5 secondes)
    const interval = setInterval(loadOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data);
    } catch (e) {
      console.warn('Fetch order error', e?.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrder();
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Annuler la commande',
      'Êtes-vous sûr de vouloir annuler cette commande ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              const { data } = await api.put(`/orders/${orderId}/status`, {
                status: 'CANCELLED',
              });
              dispatch(updateOrderStatus({ id: orderId, status: 'CANCELLED' }));
              setOrder(data);
              Alert.alert('Succès', 'Votre commande a été annulée');
            } catch (e) {
              Alert.alert(
                'Erreur',
                e?.response?.data?.error || 'Impossible d\'annuler la commande'
              );
              console.warn('Cancel order error', e?.response?.data || e.message);
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#ffd43b';
      case 'ACCEPTED':
        return '#51cf66';
      case 'EN_COURS':
        return '#6270ff';
      case 'LIVREE':
        return '#51cf66';
      case 'CANCELLED':
        return '#ff6b6b';
      default:
        return '#9fb5ff';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return 'time';
      case 'ACCEPTED':
        return 'checkmark-circle';
      case 'EN_COURS':
        return 'bicycle';
      case 'LIVREE':
        return 'checkmark-done-circle';
      case 'CANCELLED':
        return 'close-circle';
      default:
        return 'ellipse';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return 'En attente de confirmation';
      case 'ACCEPTED':
        return 'Acceptée - En attente du livreur';
      case 'EN_COURS':
        return 'En cours de livraison';
      case 'LIVREE':
        return 'Commande livrée';
      case 'CANCELLED':
        return 'Commande annulée';
      default:
        return status;
    }
  };

  const getStatusSteps = () => {
    if (!order) return [];
    const statuses = ['PENDING', 'ACCEPTED', 'EN_COURS', 'LIVREE'];
    const currentIndex = statuses.indexOf(order.status);
    return statuses.map((status, index) => ({
      status,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotal = () => {
    if (!order) return '0.00';
    if (order.total) return order.total.toFixed(2);
    let total = 0;
    if (order.items) {
      for (const item of order.items) {
        total += (item.dish?.price || 0) * item.qty;
      }
    }
    return total.toFixed(2);
  };

  if (loading && !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6270ff" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Commande non trouvée</Text>
      </View>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#6270ff"
        />
      }
    >
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <Text style={styles.title}>Commande #{order.id}</Text>
        <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
      </Animated.View>

      {/* Statut actuel */}
      <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.statusCard}>
        <LinearGradient
          colors={[getStatusColor(order.status) + '20', getStatusColor(order.status) + '10']}
          style={styles.statusGradient}
        >
          <View style={styles.statusContent}>
            <Ionicons
              name={getStatusIcon(order.status)}
              size={48}
              color={getStatusColor(order.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {getStatusLabel(order.status)}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Étapes de suivi */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.stepsCard}>
        <Text style={styles.sectionTitle}>Suivi de la commande</Text>
        {statusSteps.map((step, index) => (
          <View key={step.status} style={styles.stepRow}>
            <View style={styles.stepIndicator}>
              {step.completed ? (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={step.current ? '#6270ff' : '#51cf66'}
                />
              ) : (
                <View style={[styles.stepCircle, step.current && styles.stepCircleActive]} />
              )}
              {index < statusSteps.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    step.completed && styles.stepLineCompleted
                  ]}
                />
              )}
            </View>
            <View style={styles.stepContent}>
              <Text
                style={[
                  styles.stepLabel,
                  step.completed && styles.stepLabelCompleted
                ]}
              >
                {getStatusLabel(step.status)}
              </Text>
            </View>
          </View>
        ))}
      </Animated.View>

      {/* Informations de livraison */}
      {order.address && (
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.deliveryCard}>
          <Text style={styles.sectionTitle}>Informations de livraison</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#9fb5ff" />
            <Text style={styles.infoText}>{order.address}</Text>
          </View>
          {order.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#9fb5ff" />
              <Text style={styles.infoText}>{order.phone}</Text>
            </View>
          )}
          {order.notes && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text" size={20} color="#9fb5ff" />
              <Text style={styles.infoText}>{order.notes}</Text>
            </View>
          )}
        </Animated.View>
      )}

      {/* Articles */}
      <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.itemsCard}>
        <Text style={styles.sectionTitle}>Articles commandés</Text>
        {order.items?.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>
                {item.dish?.name || `Plat #${item.dishId}`}
              </Text>
              <Text style={styles.itemPrice}>
                {(item.dish?.price || 0).toFixed(2)} € × {item.qty}
              </Text>
            </View>
            <Text style={styles.itemTotal}>
              {((item.dish?.price || 0) * item.qty).toFixed(2)} €
            </Text>
          </View>
        ))}
      </Animated.View>

      {/* Total */}
      <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.totalCard}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>{calculateTotal()} €</Text>
        </View>
      </Animated.View>

              {/* Bouton d'annulation */}
              {(order.status === 'PENDING' || order.status === 'ACCEPTED') && user?.role === 'CLIENT' && (
        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.cancelButtonContainer}>
          <Button
            title="Annuler la commande"
            onPress={handleCancelOrder}
            loading={cancelling}
            variant="secondary"
            style={styles.cancelButton}
          />
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f1a',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
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
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  date: {
    color: '#9fb5ff',
    fontSize: 14,
  },
  statusCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  statusGradient: {
    padding: 24,
  },
  statusContent: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  stepsCard: {
    backgroundColor: '#151a2d',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2b355e',
  },
  stepCircleActive: {
    borderColor: '#6270ff',
    backgroundColor: '#6270ff20',
  },
  stepLine: {
    width: 2,
    height: 30,
    backgroundColor: '#2b355e',
    marginTop: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#51cf66',
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepLabel: {
    color: '#9fb5ff',
    fontSize: 14,
  },
  stepLabelCompleted: {
    color: '#ffffff',
    fontWeight: '600',
  },
  itemsCard: {
    backgroundColor: '#151a2d',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2440',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    color: '#9fb5ff',
    fontSize: 14,
  },
  itemTotal: {
    color: '#6270ff',
    fontSize: 16,
    fontWeight: '700',
  },
  totalCard: {
    backgroundColor: '#151a2d',
    borderRadius: 20,
    padding: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  totalPrice: {
    color: '#6270ff',
    fontSize: 28,
    fontWeight: '800',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  deliveryCard: {
    backgroundColor: '#151a2d',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    color: '#ffffff',
    fontSize: 16,
    flex: 1,
  },
  cancelButtonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#ff6b6b',
  },
});
