import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { setMenu } from '../../store/menuSlice';
import api from '../../services/api';
import DishCard from '../../components/DishCard';
import Header from '../../components/Header';
import EmptyState from '../../components/EmptyState';

/**
 * Écran Menu - Affiche tous les plats disponibles avec design moderne
 */
export default function MenuScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const items = useSelector((s) => s.menu.items);
  const cartItems = useSelector((s) => s.cart.items);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const badgeScale = useSharedValue(1);
  
  React.useEffect(() => {
    if (cartCount > 0) {
      badgeScale.value = withSpring(1.2, {}, () => {
        badgeScale.value = withSpring(1);
      });
    }
  }, [cartCount]);
  
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const loadDishes = async () => {
    try {
      const { data } = await api.get('/dishes');
      dispatch(setMenu(data));
    } catch (e) {
      console.warn('Fetch dishes error', e?.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDishes();
  }, [dispatch]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDishes();
  };

  const handleDishPress = (item) => {
    // Navigation vers les détails si nécessaire, sinon juste ajouter au panier
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6270ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Menu"
        subtitle={`${items.length} plat${items.length > 1 ? 's' : ''} disponible${items.length > 1 ? 's' : ''}`}
        showLogout={true}
        rightComponent={
          cartCount > 0 ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('Cart')}
              style={styles.cartButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#6270ff', '#7c8aff']}
                style={styles.cartButtonGradient}
              >
                <Ionicons name="cart" size={20} color="#fff" />
                <Animated.View style={[styles.badge, badgeStyle]}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </Animated.View>
              </LinearGradient>
            </TouchableOpacity>
          ) : null
        }
      />
      {items.length === 0 ? (
        <EmptyState
          icon="🍽️"
          title="Aucun plat disponible"
          message="Le menu est en cours de préparation..."
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <DishCard dish={item} onPress={() => handleDishPress(item)} />
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
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  cartButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cartButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  badge: {
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
