import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addOrder } from '../../store/orderSlice';
import api from '../../services/api';
import Button from '../../components/Button';
import SectionHeader from '../../components/SectionHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

/**
 * Écran Checkout - Commande d'un plat avec informations de livraison
 */
export default function CheckoutScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const item = route.params?.item;
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Aucun plat sélectionné</Text>
      </View>
    );
  }

  const imageUri = item.photo || `https://via.placeholder.com/400x300/6270ff/ffffff?text=${encodeURIComponent(item.name)}`;
  const total = (item.price * quantity).toFixed(2);

  const validateForm = () => {
    if (!address.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse de livraison');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre numéro de téléphone');
      return false;
    }
    // Validation basique du téléphone
    if (phone.trim().length < 8) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return false;
    }
    return true;
  };

  const handleOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: [{ dishId: item.id, qty: quantity }],
        userId: user?.id,
        address: address.trim(),
        phone: phone.trim(),
        notes: notes.trim() || null,
      });
      dispatch(addOrder(data));
      Alert.alert(
        'Succès', 
        'Votre commande a été passée avec succès! Le livreur vous contactera bientôt.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              setAddress('');
              setPhone('');
              setNotes('');
              navigation.goBack();
            }
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

  const adjustQuantity = (delta) => {
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <SectionHeader title="Commander" subtitle={item.name} />
      
      <View style={styles.content}>
        <LinearGradient
          colors={['#151a2d', '#1e2440']}
          style={styles.imageContainer}
        >
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        </LinearGradient>

        <View style={styles.details}>
          <Text style={styles.name}>{item.name}</Text>
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.label}>Prix unitaire:</Text>
            <Text style={styles.unitPrice}>{item.price.toFixed(2)} €</Text>
          </View>

          <View style={styles.quantityContainer}>
            <Text style={styles.label}>Quantité:</Text>
            <View style={styles.quantityControls}>
              <Button
                title="-"
                onPress={() => adjustQuantity(-1)}
                variant="secondary"
                style={styles.quantityButton}
              />
              <Text style={styles.quantity}>{quantity}</Text>
              <Button
                title="+"
                onPress={() => adjustQuantity(1)}
                variant="secondary"
                style={styles.quantityButton}
              />
            </View>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>{total} €</Text>
          </View>
        </View>

        {/* Informations de livraison */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.deliverySection}>
          <Text style={styles.sectionTitle}>Informations de livraison</Text>
          <Text style={styles.sectionSubtitle}>Ces informations sont nécessaires pour le livreur</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="location" size={20} color="#9fb5ff" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Adresse complète"
              placeholderTextColor="#9fb5ff"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call" size={20} color="#9fb5ff" style={styles.inputIcon} />
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
            <Ionicons name="document-text" size={20} color="#9fb5ff" style={styles.inputIcon} />
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

          <Button
            title="Valider la commande"
            onPress={handleOrder}
            loading={loading}
            style={styles.orderButton}
          />
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f1a',
  },
  content: {
    padding: 20,
  },
  imageContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#1e2440',
  },
  details: {
    backgroundColor: '#151a2d',
    borderRadius: 20,
    padding: 20,
  },
  name: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  description: {
    color: '#9fb5ff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2440',
  },
  label: {
    color: '#9fb5ff',
    fontSize: 16,
    fontWeight: '600',
  },
  unitPrice: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  quantityContainer: {
    marginBottom: 24,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quantityButton: {
    width: 50,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  quantity: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e2440',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  totalLabel: {
    color: '#9fb5ff',
    fontSize: 20,
    fontWeight: '600',
  },
  totalPrice: {
    color: '#6270ff',
    fontSize: 32,
    fontWeight: '800',
  },
  orderButton: {
    marginTop: 8,
  },
  deliverySection: {
    backgroundColor: '#151a2d',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#9fb5ff',
    fontSize: 14,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1e2440',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2b355e',
  },
  inputIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 4,
    minHeight: 40,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});
