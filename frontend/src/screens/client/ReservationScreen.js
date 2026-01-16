import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { setTables } from '../../store/tableSlice';
import { setReservations } from '../../store/reservationSlice';
import api from '../../services/api';
import RestaurantLayout from '../../components/RestaurantLayout';
import { useNavigation } from '@react-navigation/native';

/**
 * Écran de réservation - Réserver une table ou une livraison
 */
export default function ReservationScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector((s) => s.auth);
  const tables = useSelector((s) => s.tables.list);
  const reservations = useSelector((s) => s.reservations.list);
  const [name, setName] = useState(user?.name || '');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [guests, setGuests] = useState('');
  const [type, setType] = useState('SUR_PLACE');
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingReservations, setLoadingReservations] = useState(true);

  useEffect(() => {
    loadTables();
  }, [dispatch, selectedDate]);

  useEffect(() => {
    loadReservations();
  }, [user?.id, dispatch]);

  const loadTables = async () => {
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const { data } = await api.get('/tables', { params: { date: dateString } });
      dispatch(setTables(data));
    } catch (e) {
      console.warn('Fetch tables error', e?.response?.data || e.message);
    } finally {
      setLoadingTables(false);
    }
  };

  const loadReservations = async () => {
    try {
      setLoadingReservations(true);
      console.log('Chargement des réservations...');
      const { data } = await api.get('/reservations');
      console.log('Réservations chargées:', data);
      console.log('Nombre de réservations:', data?.length || 0);
      dispatch(setReservations(data));
    } catch (e) {
      console.warn('Fetch reservations error', e?.response?.data || e.message);
    } finally {
      setLoadingReservations(false);
    }
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
        return 'En attente';
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
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const onDateChange = (event, selected) => {
    setShowDatePicker(false);
    if (selected) {
      setSelectedDate(selected);
    }
  };

  const submit = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom');
      return;
    }

    // Vérifier que la date n'est pas dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    
    if (selected < today) {
      Alert.alert('Erreur', 'Vous ne pouvez pas réserver dans le passé');
      return;
    }

    if (type === 'SUR_PLACE') {
      if (!selectedTableId) {
        Alert.alert('Erreur', 'Veuillez sélectionner une table');
        return;
      }
      if (!guests.trim()) {
        Alert.alert('Erreur', 'Veuillez indiquer le nombre de personnes');
        return;
      }
      const selectedTable = tables.find(t => t.id === selectedTableId);
      
      if (!selectedTable) {
        Alert.alert('Erreur', 'Table non trouvée');
        return;
      }
      
      // Vérifier si la table est disponible aujourd'hui
      const isAvailableToday = selectedTable.availableToday !== undefined 
        ? selectedTable.availableToday 
        : selectedTable.available;
        
      if (!isAvailableToday) {
        Alert.alert('Erreur', 'Cette table n\'est plus disponible aujourd\'hui. Elle a déjà une réservation.');
        return;
      }
      
      if (parseInt(guests) > selectedTable.seats) {
        Alert.alert('Erreur', `Cette table ne peut accueillir que ${selectedTable.seats} personnes`);
        return;
      }
    }

    setLoading(true);
    try {
      // Construire la date au format correct YYYY-MM-DD
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      // Créer une date ISO avec les composants UTC pour éviter les problèmes de fuseau horaire
      const dateObj = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(selectedHour),
        parseInt(selectedMinute),
        0
      ));
      
      // Préparer le payload avec la date en format ISO string
      const payload = {
        name: name.trim(),
        date: dateObj.toISOString(),
        type: type,
        tableId: type === 'SUR_PLACE' ? selectedTableId : null,
        guests: type === 'SUR_PLACE' ? parseInt(guests) : null,
      };
      
      const { data } = await api.post('/reservations', payload);
      
      // Recharger les tables et réservations pour mettre à jour les disponibilités
      await loadTables();
      await loadReservations();
      
      Alert.alert(
        'Réservation en attente',
        `Votre réservation a été enregistrée.\n\nElle est en attente de confirmation par l'administrateur.`,
        [
          {
            text: 'Voir mes réservations',
            onPress: () => {
              setName(user?.name || '');
              setSelectedDate(new Date());
              setSelectedHour('12');
              setSelectedMinute('00');
              setGuests('');
              setSelectedTableId(null);
              navigation.navigate('ReservationsHistory');
            }
          },
          {
            text: 'OK',
            style: 'cancel',
            onPress: () => {
              setName(user?.name || '');
              setSelectedDate(new Date());
              setSelectedHour('12');
              setSelectedMinute('00');
              setGuests('');
              setSelectedTableId(null);
            }
          }
        ]
      );
    } catch (e) {
      console.warn('Create reservation error', e?.response?.data || e.message);
      
      let errorMessage = 'Impossible de créer la réservation';
      
      if (e?.message === 'Network Error' || e?.code === 'ECONNREFUSED') {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
      } else if (e?.response?.data?.error) {
        errorMessage = e.response.data.error;
      } else if (e?.response?.status === 400) {
        errorMessage = 'Données invalides. Vérifiez les informations saisies.';
      } else if (e?.response?.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <Text style={styles.title}>Réserver une table</Text>
        <Text style={styles.subtitle}>
          Réservez une table au restaurant
        </Text>
      </Animated.View>

      {/* Section Mes Réservations - Toujours afficher pour débogage */}
      <Animated.View entering={FadeInDown.delay(50).duration(600)} style={styles.recentReservationsSection}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.recentReservationsTitle}>Mes Réservations Récentes</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('ReservationsHistory')}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllButtonText}>Voir tout</Text>
            <Ionicons name="chevron-forward" size={16} color="#6270ff" />
          </TouchableOpacity>
        </View>
        
        {loadingReservations ? (
          <View style={styles.emptyReservations}>
            <ActivityIndicator size="small" color="#6270ff" />
            <Text style={styles.emptyReservationsText}>Chargement...</Text>
          </View>
        ) : reservations.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reservationsScroll}>
            {reservations.slice(0, 3).map((reservation, index) => (
              <Animated.View 
                key={reservation.id} 
                entering={FadeInDown.delay(100 + index * 50).duration(400)}
                style={styles.reservationCardSmall}
              >
                <LinearGradient
                  colors={['#1e2440', '#151a2d']}
                  style={styles.reservationCardContent}
                >
                  <View style={styles.cardStatus}>
                    <Ionicons 
                      name={getStatusIcon(reservation.status)} 
                      size={16} 
                      color={getStatusColor(reservation.status)[0]}
                    />
                    <Text style={[styles.statusLabel, { color: getStatusColor(reservation.status)[0] }]}>
                      {getStatusLabel(reservation.status)}
                    </Text>
                  </View>
                  <Text style={styles.cardName}>{reservation.name}</Text>
                  <Text style={styles.cardDate}>{formatDate(reservation.date)}</Text>
                  {reservation.table && (
                    <Text style={styles.cardTable}>Table: {reservation.table.name}</Text>
                  )}
                </LinearGradient>
              </Animated.View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyReservations}>
            <Ionicons name="calendar-outline" size={32} color="#9fb5ff" />
            <Text style={styles.emptyReservationsText}>Aucune réservation pour le moment</Text>
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.form}>

        {/* Nom */}
        <View style={styles.inputContainer}>
          <Ionicons name="person" size={20} color="#9fb5ff" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Votre nom"
            placeholderTextColor="#9fb5ff"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Date avec DatePicker */}
        <TouchableOpacity 
          style={styles.inputContainer}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar" size={18} color="#9fb5ff" style={styles.inputIcon} />
          <Text style={styles.dateText}>{formatDateDisplay(selectedDate)}</Text>
          <Ionicons name="chevron-down" size={20} color="#9fb5ff" />
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
            locale="fr-FR"
          />
        )}

        {/* Heure - Sélecteur */}
        <View style={styles.timeContainer}>
          <View style={styles.timePickerSection}>
            <Text style={styles.timeLabel}>Heure</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.hourScroll}
            >
              {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((hour) => (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.hourButton,
                    selectedHour === hour && styles.hourButtonSelected
                  ]}
                  onPress={() => setSelectedHour(hour)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.hourButtonText,
                    selectedHour === hour && styles.hourButtonTextSelected
                  ]}>
                    {hour}h
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.timePickerSection}>
            <Text style={styles.timeLabel}>Minute</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.minuteScroll}
            >
              {['00', '15', '30', '45'].map((minute) => (
                <TouchableOpacity
                  key={minute}
                  style={[
                    styles.minuteButton,
                    selectedMinute === minute && styles.minuteButtonSelected
                  ]}
                  onPress={() => setSelectedMinute(minute)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.minuteButtonText,
                    selectedMinute === minute && styles.minuteButtonTextSelected
                  ]}>
                    {minute}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Sélection de table */}
        {loadingTables ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6270ff" />
            <Text style={styles.loadingText}>Chargement des tables...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Sélectionnez une table</Text>
            <RestaurantLayout
              tables={tables}
              selectedTableId={selectedTableId}
              onTableSelect={setSelectedTableId}
            />
            {selectedTableId && (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.selectedTableInfo}>
                <Ionicons name="checkmark-circle" size={20} color="#51cf66" />
                <Text style={styles.selectedTableText}>
                  Table sélectionnée: {tables.find(t => t.id === selectedTableId)?.name}
                </Text>
              </Animated.View>
            )}
            <View style={styles.inputContainer}>
              <Ionicons name="people" size={20} color="#9fb5ff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre de personnes"
                placeholderTextColor="#9fb5ff"
                value={guests}
                onChangeText={setGuests}
                keyboardType="numeric"
              />
            </View>
          </>
        )}

        {/* Bouton de soumission */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={submit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#6270ff', '#7c8aff']}
            style={styles.submitButtonGradient}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.submitButtonText}>
              {loading ? 'Enregistrement...' : 'Confirmer la réservation'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f1a',
  },
  contentContainer: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 32,
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
  form: {
    gap: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  typeButtonActive: {
    transform: [{ scale: 1.02 }],
  },
  typeButtonGradient: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  typeButtonText: {
    color: '#9fb5ff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2440',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2b355e',
    minHeight: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingVertical: 12,
  },
  dateText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingVertical: 12,
    textTransform: 'capitalize',
  },
  timeContainer: {
    gap: 12,
  },
  timePickerSection: {
    gap: 8,
  },
  timeLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  hourScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  hourButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#1e2440',
    borderWidth: 1,
    borderColor: '#2b355e',
  },
  hourButtonSelected: {
    backgroundColor: '#6270ff',
    borderColor: '#7c8aff',
  },
  hourButtonText: {
    color: '#9fb5ff',
    fontSize: 13,
    fontWeight: '600',
  },
  hourButtonTextSelected: {
    color: '#fff',
  },
  minuteScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  minuteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#1e2440',
    borderWidth: 1,
    borderColor: '#2b355e',
  },
  minuteButtonSelected: {
    backgroundColor: '#6270ff',
    borderColor: '#7c8aff',
  },
  minuteButtonText: {
    color: '#9fb5ff',
    fontSize: 13,
    fontWeight: '600',
  },
  minuteButtonTextSelected: {
    color: '#fff',
  },
  todayButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#6270ff',
    borderRadius: 6,
    marginLeft: 8,
  },
  todayButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  todayButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#6270ff',
    borderRadius: 6,
    marginLeft: 8,
  },
  todayButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#6270ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  sectionLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 6,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#9fb5ff',
    marginTop: 10,
    fontSize: 13,
  },
  selectedTableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15321a',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    gap: 8,
  },
  selectedTableText: {
    color: '#51cf66',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#9fb5ff',
    marginTop: 12,
    fontSize: 14,
  },
  sectionLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  selectedTableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15321a',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  selectedTableText: {
    color: '#51cf66',
    fontSize: 14,
    fontWeight: '600',
  },
  recentReservationsSection: {
    marginBottom: 24,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  recentReservationsTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllButtonText: {
    color: '#6270ff',
    fontSize: 13,
    fontWeight: '600',
  },
  reservationsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  reservationCardSmall: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    width: 160,
  },
  reservationCardContent: {
    padding: 12,
    height: 140,
    justifyContent: 'space-between',
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  cardDate: {
    color: '#9fb5ff',
    fontSize: 11,
    marginTop: 4,
  },
  cardTable: {
    color: '#9fb5ff',
    fontSize: 11,
    marginTop: 2,
  },
  emptyReservations: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  emptyReservationsText: {
    color: '#9fb5ff',
    fontSize: 13,
    marginTop: 8,
  },
});
