import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { setReservations, removeReservation } from '../../store/reservationSlice';
import api from '../../services/api';
import SectionHeader from '../../components/SectionHeader';
import EmptyState from '../../components/EmptyState';

/**
 * Écran Historique des réservations - Client
 */
export default function ReservationsHistoryScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const reservations = useSelector((s) => s.reservations.list);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReservations();
    // Polling pour mettre à jour le statut (toutes les 10 secondes)
    const interval = setInterval(loadReservations, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const loadReservations = async () => {
    if (!user?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const { data } = await api.get('/reservations');
      dispatch(setReservations(data));
    } catch (e) {
      console.warn('Fetch reservations error', e?.response?.data || e.message);
      Alert.alert('Erreur', 'Impossible de charger les réservations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadReservations();
  };

  const handleDeleteReservation = (reservationId, reservationName) => {
    Alert.alert(
      'Confirmation de suppression',
      `Êtes-vous sûr de vouloir supprimer la réservation au nom de ${reservationName} ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/reservations/${reservationId}`);
              dispatch(removeReservation(reservationId));
              Alert.alert('Succès', 'Réservation supprimée avec succès');
            } catch (e) {
              console.warn('Delete reservation error', e?.response?.data || e.message);
              Alert.alert('Erreur', 'Impossible de supprimer la réservation');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return ['#ffd43b', '#ffec8c'];
      case 'CONFIRMED':
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
      case 'CONFIRMED':
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
        return 'En attente de confirmation';
      case 'CONFIRMED':
        return 'Confirmée';
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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderReservationItem = ({ item, index }) => (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(400)}
      style={styles.reservationCard}
    >
      <TouchableOpacity activeOpacity={0.8}>
        <LinearGradient
          colors={['#151a2d', '#1e2440']}
          style={styles.reservationGradient}
        >
          <View style={styles.reservationHeader}>
            <View style={styles.reservationInfo}>
              <Text style={styles.reservationType}>
                {item.type === 'SUR_PLACE' ? 'Sur place' : 'Livraison'}
              </Text>
              {item.table && (
                <Text style={styles.reservationTable}>Table: {item.table.name}</Text>
              )}
              {item.guests && (
                <Text style={styles.reservationGuests}>{item.guests} personne{item.guests > 1 ? 's' : ''}</Text>
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

          <View style={styles.reservationDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="person" size={16} color="#9fb5ff" />
              <Text style={styles.detailText}>{item.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={16} color="#9fb5ff" />
              <Text style={styles.detailText}>{formatDate(item.date)}</Text>
            </View>
            {item.status === 'PENDING' && (
              <View style={styles.pendingNotice}>
                <Ionicons name="information-circle" size={20} color="#ffd43b" />
                <Text style={styles.pendingText}>
                  En attente de confirmation par l'administrateur
                </Text>
              </View>
            )}
            {item.status !== 'CANCELLED' && (
              <TouchableOpacity
                onPress={() => handleDeleteReservation(item.id, item.name)}
                style={styles.deleteButton}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
                <Text style={styles.deleteButtonText}>Supprimer la réservation</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6270ff" />
        <Text style={styles.loadingText}>Chargement des réservations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Mes Réservations"
        subtitle="Historique de vos réservations"
      />

      {reservations.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="Aucune réservation"
          message="Vos réservations apparaîtront ici."
        />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReservationItem}
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
  reservationCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  reservationGradient: {
    padding: 20,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reservationInfo: {
    flex: 1,
  },
  reservationType: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  reservationTable: {
    color: '#9fb5ff',
    fontSize: 14,
    marginBottom: 2,
  },
  reservationGuests: {
    color: '#9fb5ff',
    fontSize: 14,
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
  reservationDetails: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e2440',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    color: '#ffffff',
    fontSize: 14,
  },
  pendingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2a1a',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  pendingText: {
    color: '#ffd43b',
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d1a1a',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: '#ff6b6b',
    fontSize: 13,
    fontWeight: '600',
  },
});
