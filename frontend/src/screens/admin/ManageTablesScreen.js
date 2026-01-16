import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { setTables } from '../../store/tableSlice';
import api from '../../services/api';

/**
 * Écran Gestion des Tables - CRUD complet (ADMIN)
 */
export default function ManageTablesScreen() {
  const { list } = useSelector((s) => s.tables);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({ name: '', seats: '4' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const { data } = await api.get('/tables');
      dispatch(setTables(data));
    } catch (e) {
      console.warn('Fetch tables error', e?.response?.data || e.message);
      Alert.alert('Erreur', 'Impossible de charger les tables');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTables();
  };

  const openModal = (table = null) => {
    if (table) {
      setEditingTable(table);
      setFormData({ name: table.name, seats: table.seats.toString() });
    } else {
      setEditingTable(null);
      setFormData({ name: '', seats: '4' });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingTable(null);
    setFormData({ name: '', seats: '4' });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Le nom de la table est requis');
      return;
    }

    const seats = parseInt(formData.seats);
    if (isNaN(seats) || seats < 1 || seats > 20) {
      Alert.alert('Erreur', 'Le nombre de places doit être entre 1 et 20');
      return;
    }

    setSaving(true);
    try {
      if (editingTable) {
        // Mise à jour
        const { data } = await api.put(`/tables/${editingTable.id}`, {
          name: formData.name.trim(),
          seats
        });
        dispatch(setTables(list.map(t => t.id === data.id ? data : t)));
        Alert.alert('Succès', 'Table mise à jour avec succès');
      } else {
        // Création
        const { data } = await api.post('/tables', {
          name: formData.name.trim(),
          seats,
          available: true
        });
        dispatch(setTables([...list, data]));
        Alert.alert('Succès', 'Table créée avec succès');
      }
      closeModal();
    } catch (e) {
      console.warn('Save table error', e?.response?.data || e.message);
      Alert.alert('Erreur', e?.response?.data?.error || 'Impossible de sauvegarder la table');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (table) => {
    Alert.alert(
      'Supprimer la table',
      `Êtes-vous sûr de vouloir supprimer ${table.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/tables/${table.id}`);
              dispatch(setTables(list.filter(t => t.id !== table.id)));
              Alert.alert('Succès', 'Table supprimée avec succès');
            } catch (e) {
              console.warn('Delete table error', e?.response?.data || e.message);
              Alert.alert('Erreur', e?.response?.data?.error || 'Impossible de supprimer la table');
            }
          }
        }
      ]
    );
  };

  const toggleAvailability = async (table) => {
    try {
      const { data } = await api.put(`/tables/${table.id}/availability`, {
        available: !table.available
      });
      dispatch(setTables(list.map(t => t.id === data.id ? data : t)));
    } catch (e) {
      console.warn('Update table availability error', e?.response?.data || e.message);
      Alert.alert('Erreur', 'Impossible de mettre à jour la disponibilité');
    }
  };

  const renderTableItem = ({ item, index }) => {
    // Vérifier si la table a une réservation confirmée/en attente aujourd'hui
    const hasReservationToday = item.hasReservationToday || false;
    const isActuallyAvailable = item.availableToday !== undefined 
      ? item.availableToday 
      : item.available && !hasReservationToday;

    return (
      <Animated.View
        entering={FadeIn.delay(index * 50).duration(400)}
        style={styles.tableCard}
      >
        <LinearGradient
          colors={['#151a2d', '#1e2440']}
          style={styles.tableGradient}
        >
          <View style={styles.tableHeader}>
            <View style={styles.tableInfo}>
              <Text style={styles.tableName}>{item.name}</Text>
              <View style={styles.tableMeta}>
                <Ionicons name="people" size={16} color="#9fb5ff" />
                <Text style={styles.tableSeats}>{item.seats} places</Text>
              </View>
              {hasReservationToday && (
                <View style={styles.reservationNotice}>
                  <Ionicons name="calendar" size={14} color="#ffd43b" />
                  <Text style={styles.reservationNoticeText}>
                    Réservation aujourd'hui
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  isActuallyAvailable ? styles.statusAvailable : styles.statusOccupied
                ]}
              >
                <Text style={styles.statusText}>
                  {isActuallyAvailable ? 'Libre' : 'Occupée'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.toggleButton]}
              onPress={() => toggleAvailability(item)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={item.available ? 'lock-closed' : 'lock-open'}
                size={18}
                color="#fff"
              />
              <Text style={styles.actionButtonText}>
                {item.available ? 'Marquer occupée' : 'Marquer libre'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => openModal(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="create" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Modifier</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="trash" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

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
        <Text style={styles.title}>Gérer les tables</Text>
        <Text style={styles.subtitle}>
          {list.length} table{list.length > 1 ? 's' : ''}
        </Text>
      </Animated.View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => openModal()}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#6270ff', '#7c8aff']}
          style={styles.addButtonGradient}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Ajouter une table</Text>
        </LinearGradient>
      </TouchableOpacity>

      {list.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="grid-outline" size={64} color="#9fb5ff" />
          <Text style={styles.emptyText}>Aucune table</Text>
          <Text style={styles.emptySubtext}>
            Ajoutez votre première table
          </Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id.toString()}
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

      {/* Modal de création/édition */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTable ? 'Modifier la table' : 'Nouvelle table'}
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons name="grid" size={20} color="#9fb5ff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nom de la table"
                placeholderTextColor="#9fb5ff"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="people" size={20} color="#9fb5ff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre de places"
                placeholderTextColor="#9fb5ff"
                value={formData.seats}
                onChangeText={(text) => setFormData({ ...formData, seats: text })}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingTable ? 'Modifier' : 'Créer'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6270ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tableInfo: {
    flex: 1,
  },
  tableName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  tableMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tableSeats: {
    color: '#9fb5ff',
    fontSize: 14,
  },
  reservationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: '#2d2a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  reservationNoticeText: {
    color: '#ffd43b',
    fontSize: 11,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusAvailable: {
    backgroundColor: '#51cf6620',
  },
  statusOccupied: {
    backgroundColor: '#ff6b6b20',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  toggleButton: {
    backgroundColor: '#2b355e',
  },
  editButton: {
    backgroundColor: '#6270ff',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#151a2d',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2440',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2b355e',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2b355e',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#6270ff',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
