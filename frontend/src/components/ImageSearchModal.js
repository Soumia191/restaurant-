import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { searchDishImages, getPopularDishImages } from '../services/imageSearch';

/**
 * Modal de recherche d'images pour les plats
 */
export default function ImageSearchModal({ visible, onClose, onSelectImage }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (visible) {
      loadPopularImages();
    } else {
      setSearchQuery('');
      setImages([]);
    }
  }, [visible]);

  const loadPopularImages = async () => {
    setLoading(true);
    try {
      const popularImages = getPopularDishImages();
      setImages(popularImages);
    } catch (error) {
      console.warn('Erreur chargement images populaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPopularImages();
      return;
    }

    setSearching(true);
    try {
      const results = await searchDishImages(searchQuery.trim(), 20);
      setImages(results);
    } catch (error) {
      console.warn('Erreur recherche images:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectImage = (image) => {
    onSelectImage(image.url || image.full || image.small);
    onClose();
  };

  const renderImageItem = ({ item, index }) => (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(400)}
      style={styles.imageContainer}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleSelectImage(item)}
        style={styles.imageCard}
      >
        <Image
          source={{ uri: item.thumbnail || item.small || item.url }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.imageOverlay}
        >
          <Text style={styles.imageDescription} numberOfLines={2}>
            {item.description || 'Image'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Rechercher une image</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#9fb5ff" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher (ex: pizza, pasta, burger...)"
                placeholderTextColor="#9fb5ff"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#9fb5ff" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={searching}
            >
              <LinearGradient
                colors={['#6270ff', '#7c8aff']}
                style={styles.searchButtonGradient}
              >
                {searching ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.searchButtonText}>Rechercher</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Images Grid */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6270ff" />
              <Text style={styles.loadingText}>Chargement des images...</Text>
            </View>
          ) : images.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="image-outline" size={64} color="#9fb5ff" />
              <Text style={styles.emptyText}>Aucune image trouvée</Text>
              <Text style={styles.emptySubtext}>
                Essayez de rechercher avec un autre terme
              </Text>
            </View>
          ) : (
            <FlatList
              data={images}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderImageItem}
              numColumns={2}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  container: {
    flex: 1,
    backgroundColor: '#0b0f1a',
    marginTop: 60,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2440',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2440',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2440',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  searchButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    padding: 14,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    padding: 12,
  },
  imageContainer: {
    flex: 1,
    margin: 6,
    aspectRatio: 1,
  },
  imageCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1e2440',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  imageDescription: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#9fb5ff',
    marginTop: 16,
    fontSize: 16,
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
