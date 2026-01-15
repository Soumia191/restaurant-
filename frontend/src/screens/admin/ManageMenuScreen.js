import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { addDish, updateDish, removeDish, setMenu } from '../../store/menuSlice';
import api from '../../services/api';
import ImageSearchModal from '../../components/ImageSearchModal';

/**
 * Écran de gestion du menu - Ajouter, modifier, supprimer des plats
 */
export default function ManageMenuScreen() {
  const { items } = useSelector((s) => s.menu);
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [photo, setPhoto] = useState('');
  const [description, setDescription] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [imageSearchVisible, setImageSearchVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadDishes();
  }, [dispatch]);

  const loadDishes = async () => {
    try {
      const { data } = await api.get('/dishes');
      dispatch(setMenu(data));
    } catch (e) {
      console.warn('Fetch dishes error', e?.response?.data || e.message);
      Alert.alert('Erreur', 'Impossible de charger le menu');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDishes();
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setPhoto('');
    setDescription('');
    setEditingItem(null);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setName(item.name || '');
    setPrice(item.price?.toString() || '');
    setPhoto(item.photo || '');
    setDescription(item.description || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const requestImagePermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin de votre permission pour accéder à vos photos.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestImagePermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPhoto(asset.uri);
        Alert.alert('Succès', 'Image sélectionnée. Vous pouvez maintenant l\'utiliser.');
      }
    } catch (e) {
      console.warn('Image picker error', e);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin de votre permission pour utiliser la caméra.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPhoto(asset.uri);
        Alert.alert('Succès', 'Photo prise. Vous pouvez maintenant l\'utiliser.');
      }
    } catch (e) {
      console.warn('Camera error', e);
      Alert.alert('Erreur', 'Impossible de prendre la photo');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Sélectionner une image',
      'Choisissez une option',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Prendre une photo', onPress: takePhoto },
        { text: 'Choisir depuis la galerie', onPress: pickImage },
        { text: 'Rechercher en ligne', onPress: () => setImageSearchVisible(true) },
      ]
    );
  };

  const add = async () => {
    if (!name || !price) {
      Alert.alert('Erreur', 'Veuillez remplir au moins le nom et le prix');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/dishes', {
        name,
        price: parseFloat(price),
        photo,
        description
      });
      dispatch(addDish(data));
      resetForm();
      Alert.alert('Succès', 'Plat ajouté avec succès');
    } catch (e) {
      console.warn('Add dish error', e?.response?.data || e.message);
      Alert.alert('Erreur', 'Impossible d\'ajouter le plat');
    } finally {
      setLoading(false);
    }
  };

  const update = async () => {
    if (!name || !price || !editingItem) return;

    setLoading(true);
    try {
      const { data } = await api.put(`/dishes/${editingItem.id}`, {
        name,
        price: parseFloat(price),
        photo,
        description
      });
      dispatch(updateDish(data));
      closeModal();
      Alert.alert('Succès', 'Plat modifié avec succès');
    } catch (e) {
      console.warn('Update dish error', e?.response?.data || e.message);
      Alert.alert('Erreur', 'Impossible de modifier le plat');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Supprimer le plat',
      `Êtes-vous sûr de vouloir supprimer "${item.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/dishes/${item.id}`);
              dispatch(removeDish(item.id));
              Alert.alert('Succès', 'Plat supprimé');
            } catch (e) {
              console.warn('Delete dish error', e?.response?.data || e.message);
              Alert.alert('Erreur', 'Impossible de supprimer le plat');
            }
          }
        }
      ]
    );
  };

  const imageUri = (item) => {
    if (item.photo) return item.photo;
    return `https://via.placeholder.com/200x200/6270ff/ffffff?text=${encodeURIComponent(item.name)}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header avec formulaire */}
      <ScrollView
        style={styles.headerScroll}
        contentContainerStyle={styles.headerScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <Text style={styles.title}>Gérer le menu</Text>
          <Text style={styles.subtitle}>{items.length} plat{items.length > 1 ? 's' : ''} au menu</Text>

          <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nom du plat"
            placeholderTextColor="#9fb5ff"
            value={name}
            onChangeText={setName}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="Prix (€)"
              placeholderTextColor="#9fb5ff"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.imageInputContainer}>
            <TextInput
              style={[styles.input, styles.imageInput]}
              placeholder="URL de l'image (optionnel)"
              placeholderTextColor="#9fb5ff"
              value={photo}
              onChangeText={setPhoto}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.searchImageButton}
              onPress={showImageOptions}
            >
              <LinearGradient
                colors={['#51cf66', '#69db7c']}
                style={styles.searchImageButtonGradient}
              >
                <Ionicons name="image" size={20} color="#fff" />
                <Text style={styles.searchImageButtonText}>Choisir</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.previewImage} />
          ) : null}
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optionnel)"
            placeholderTextColor="#9fb5ff"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={add}
            disabled={loading}
          >
            <LinearGradient
              colors={['#6270ff', '#7c8aff']}
              style={styles.addBtnGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color="#fff" />
                  <Text style={styles.addBtnText}>Ajouter un plat</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
      </ScrollView>

      {/* Liste des plats */}
      <FlatList
        data={items}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeIn.delay(index * 50).duration(400)}
            style={styles.card}
          >
            <LinearGradient
              colors={['#151a2d', '#1e2440']}
              style={styles.cardGradient}
            >
              <Image source={{ uri: imageUri(item) }} style={styles.photo} />
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardPrice}>{item.price?.toFixed(2)} €</Text>
                {item.description && (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => openEditModal(item)}
                  >
                    <Ionicons name="create" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(item)}
                  >
                    <Ionicons name="trash" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#6270ff"
            colors={['#6270ff']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color="#9fb5ff" />
            <Text style={styles.emptyText}>Aucun plat dans le menu</Text>
            <Text style={styles.emptySubtext}>Ajoutez votre premier plat ci-dessus</Text>
          </View>
        }
      />

      {/* Modal de modification */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le plat</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalForm}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <TextInput
                style={styles.input}
                placeholder="Nom du plat"
                placeholderTextColor="#9fb5ff"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Prix (€)"
                placeholderTextColor="#9fb5ff"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
              <View style={styles.imageInputContainer}>
                <TextInput
                  style={[styles.input, styles.imageInput]}
                  placeholder="URL de l'image"
                  placeholderTextColor="#9fb5ff"
                  value={photo}
                  onChangeText={setPhoto}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.searchImageButton}
                  onPress={() => {
                    setModalVisible(false);
                    setTimeout(() => {
                      showImageOptions();
                    }, 300);
                  }}
                >
                  <LinearGradient
                    colors={['#51cf66', '#69db7c']}
                    style={styles.searchImageButtonGradient}
                  >
                    <Ionicons name="image" size={18} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                placeholderTextColor="#9fb5ff"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
              {photo ? (
                <Image source={{ uri: photo }} style={styles.previewImage} />
              ) : null}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={closeModal}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={update}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#6270ff', '#7c8aff']}
                  style={styles.saveBtnGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Enregistrer</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de recherche d'images */}
      <ImageSearchModal
        visible={imageSearchVisible}
        onClose={() => {
          setImageSearchVisible(false);
          if (editingItem) {
            setModalVisible(true);
          }
        }}
        onSelectImage={(imageUrl) => {
          setPhoto(imageUrl);
          if (editingItem) {
            setModalVisible(true);
          }
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f1a',
  },
  headerScroll: {
    flex: 0,
  },
  headerScrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 16,
    paddingTop: 20,
    backgroundColor: '#0b0f1a',
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#9fb5ff',
    fontSize: 12,
    marginBottom: 16,
  },
  form: {
    marginTop: 8,
  },
  input: {
    backgroundColor: '#1e2440',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2b355e',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  imageInputContainer: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  imageInput: {
    flex: 1,
    marginRight: 8,
  },
  searchImageButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchImageButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchImageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#1e2440',
  },
  addBtn: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  addBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardGradient: {
    flexDirection: 'row',
    padding: 16,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#1e2440',
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardPrice: {
    color: '#6270ff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  cardDesc: {
    color: '#9fb5ff',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  editBtn: {
    backgroundColor: '#2b355e',
  },
  deleteBtn: {
    backgroundColor: '#3a1a1a',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#151a2d',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2440',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  modalForm: {
    padding: 20,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelBtn: {
    backgroundColor: '#1e2440',
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
  },
  cancelBtnText: {
    color: '#9fb5ff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    overflow: 'hidden',
  },
  saveBtnGradient: {
    padding: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
