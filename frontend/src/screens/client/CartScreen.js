import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { removeFromCart, updateQuantity, clearCart } from '../../store/cartSlice';
import { addOrder } from '../../store/orderSlice';
import api from '../../services/api';
import Header from '../../components/Header';

const { width } = Dimensions.get('window');

/**
 * Écran Panier - Design moderne avec animations 3D/2D
 */
export default function CartScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + (item.dish.price * item.quantity);
    }, 0);
  };

  const validateForm = () => {
    if (!address.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse de livraison');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre numéro de téléphone');
      return false;
    }
    if (phone.trim().length < 8) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return false;
    }
    return true;
  };

  const handleOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Erreur', 'Votre panier est vide');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map(item => ({
        dishId: item.dish.id,
        qty: item.quantity,
      }));

      const { data } = await api.post('/orders', {
        items: orderItems,
        userId: user?.id,
        address: address.trim(),
        phone: phone.trim(),
        notes: notes.trim() || null,
      });

      dispatch(addOrder(data));
      dispatch(clearCart());
      
      Alert.alert(
        'Succès',
        'Votre commande a été passée avec succès!',
        [
          {
            text: 'OK',
            onPress: () => {
              setAddress('');
              setPhone('');
              setNotes('');
              navigation.navigate('Orders');
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Erreur lors de la commande');
      console.warn('Create order error', e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (dishId) => {
    Alert.alert(
      'Retirer du panier',
      'Voulez-vous retirer cet article du panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => dispatch(removeFromCart(dishId)),
        },
      ]
    );
  };

  const handleQuantityChange = (dishId, delta) => {
    const item = items.find(i => i.dish.id === dishId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta);
      dispatch(updateQuantity({ dishId, quantity: newQuantity }));
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Panier" subtitle="Votre panier est vide" showLogout={true} />
        <View style={styles.emptyContainer}>
          <Animated.View
            entering={FadeInDown.duration(600)}
            style={styles.emptyIconContainer}
          >
            <Ionicons name="cart-outline" size={80} color="#6270ff" />
          </Animated.View>
          <Animated.Text
            entering={FadeInDown.delay(100).duration(600)}
            style={styles.emptyText}
          >
            Votre panier est vide
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(200).duration(600)}
            style={styles.emptySubtext}
          >
            Ajoutez des plats depuis le menu
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Menu')}
            >
              <LinearGradient
                colors={['#6270ff', '#7c8aff']}
                style={styles.browseButtonGradient}
              >
                <Ionicons name="restaurant" size={20} color="#fff" />
                <Text style={styles.browseButtonText}>Parcourir le menu</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Panier"
        subtitle={`${items.length} article${items.length > 1 ? 's' : ''}`}
        showLogout={true}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Liste des articles */}
        {items.map((item, index) => (
          <CartItem
            key={item.dish.id}
            item={item}
            index={index}
            onRemove={() => handleRemoveItem(item.dish.id)}
            onQuantityChange={(delta) => handleQuantityChange(item.dish.id, delta)}
          />
        ))}

        {/* Informations de livraison */}
        <Animated.View
          entering={FadeInUp.delay(items.length * 50).duration(600)}
          style={styles.deliverySection}
        >
          <Text style={styles.sectionTitle}>Informations de livraison</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="location" size={18} color="#9fb5ff" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Adresse de livraison"
              placeholderTextColor="#9fb5ff"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call" size={18} color="#9fb5ff" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Numéro de téléphone"
              placeholderTextColor="#9fb5ff"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="document-text" size={18} color="#9fb5ff" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Notes pour le livreur (optionnel)"
              placeholderTextColor="#9fb5ff"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>
        </Animated.View>

        {/* Total */}
        <Animated.View
          entering={FadeInUp.delay((items.length * 50) + 100).duration(600)}
          style={styles.totalSection}
        >
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>{calculateTotal().toFixed(2)} €</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bouton de commande fixe */}
      <Animated.View
        entering={FadeInUp.delay((items.length * 50) + 200).duration(600)}
        style={styles.footer}
      >
        <TouchableOpacity
          style={styles.orderButton}
          onPress={handleOrder}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#6270ff', '#7c8aff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.orderButtonGradient}
          >
            {loading ? (
              <Text style={styles.orderButtonText}>Traitement...</Text>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.orderButtonText}>
                  Commander ({calculateTotal().toFixed(2)} €)
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// Composant pour un article du panier avec animations 2D/3D
function CartItem({ item, index, onRemove, onQuantityChange }) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    };
  });

  const imageUri = item.dish.photo || `https://via.placeholder.com/200x200/6270ff/ffffff?text=${encodeURIComponent(item.dish.name)}`;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400)}
      style={[styles.cartItem, animatedStyle]}
    >
      <LinearGradient
        colors={['#151a2d', '#1e2440']}
        style={styles.cartItemGradient}
      >
        {/* Image avec effet 3D */}
        <Animated.View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.cartImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageOverlay}
          />
        </Animated.View>

        {/* Contenu */}
        <View style={styles.cartContent}>
          <View style={styles.cartHeader}>
            <View style={styles.cartInfo}>
              <Text style={styles.cartName} numberOfLines={1}>
                {item.dish.name}
              </Text>
              <Text style={styles.cartPrice}>
                {(item.dish.price * item.quantity).toFixed(2)} €
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={onRemove}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={24} color="#ff6b6b" />
            </TouchableOpacity>
          </View>

          {/* Contrôles de quantité */}
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                scale.value = withSpring(0.9, {}, () => {
                  scale.value = withSpring(1);
                });
                onQuantityChange(-1);
              }}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#2b355e', '#1e2440']}
                style={styles.quantityButtonGradient}
              >
                <Ionicons name="remove" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{item.quantity}</Text>
            </View>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                scale.value = withSpring(1.1, {}, () => {
                  scale.value = withSpring(1);
                });
                onQuantityChange(1);
              }}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#6270ff', '#7c8aff']}
                style={styles.quantityButtonGradient}
              >
                <Ionicons name="add" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f1a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#9fb5ff',
    fontSize: 14,
    marginBottom: 32,
  },
  browseButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  browseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cartItem: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartItemGradient: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    margin: 12,
  },
  cartImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  cartContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cartInfo: {
    flex: 1,
  },
  cartName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cartPrice: {
    color: '#6270ff',
    fontSize: 18,
    fontWeight: '800',
  },
  removeButton: {
    padding: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  quantityButtonGradient: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityDisplay: {
    minWidth: 40,
    alignItems: 'center',
  },
  quantityText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  deliverySection: {
    backgroundColor: '#151a2d',
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2440',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2b355e',
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
  totalSection: {
    backgroundColor: '#151a2d',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  totalPrice: {
    color: '#6270ff',
    fontSize: 28,
    fontWeight: '800',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 20,
    backgroundColor: '#0b0f1a',
    borderTopWidth: 1,
    borderTopColor: '#1e2440',
  },
  orderButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6270ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  orderButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
