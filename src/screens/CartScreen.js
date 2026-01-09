import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import { useNavigation } from '@react-navigation/native';

export default function CartScreen() {
  const navigation = useNavigation();
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to place an order');
      navigation.navigate('Profile');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    try {
      const numCommande = `CMD-${Date.now()}`;
      const items = cart.map((item) => ({
        name_p: item.name_p,
        quantite: item.quantity,
        price_u: parseFloat(item.price),
        price: parseFloat(item.price) * item.quantity,
        rate: item.rate || 0,
      }));

      await orderAPI.createOrder({
        items,
        userEmail: user.email,
        numCommande,
      });

      clearCart();
      Alert.alert('Success', 'Order placed successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Orders'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to place order');
      console.error(error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name_p}</Text>
        <Text style={styles.itemPrice}>{item.price} MAD each</Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id_p, item.quantity - 1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id_p, item.quantity + 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalText}>
          {(item.price * item.quantity).toFixed(2)} MAD
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCart(item.id_p)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.buttonText}>Browse Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        renderItem={renderItem}
        keyExtractor={(item) => item.id_p}
        contentContainerStyle={styles.list}
      />
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>{getTotal().toFixed(2)} MAD</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 15,
  },
  cartItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  quantityButton: {
    backgroundColor: '#d4a574',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d4a574',
    marginBottom: 5,
  },
  removeButton: {
    padding: 5,
  },
  removeButtonText: {
    color: '#ff4444',
    fontSize: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 20,
    backgroundColor: '#fff',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d4a574',
  },
  checkoutButton: {
    backgroundColor: '#d4a574',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#d4a574',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
