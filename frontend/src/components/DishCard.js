import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

/**
 * Composant Card pour afficher un plat avec design moderne et animations 3D
 */
export default function DishCard({ dish, onPress, showButton = true }) {
  const dispatch = useDispatch();
  const scale = useSharedValue(1);
  const rotateY = useSharedValue(0);
  const translateY = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(rotateY.value, [0, 1], [0, 5]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotate}deg` },
        { scale: scale.value },
        { translateY: translateY.value },
      ],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    rotateY.value = withSpring(0.5);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    rotateY.value = withSpring(0);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCart({ dish, quantity: 1 }));
    
    // Animation de succès
    scale.value = withSequence(
      withSpring(1.1),
      withSpring(1)
    );
    translateY.value = withSequence(
      withSpring(-10),
      withSpring(0)
    );
  };

  // Image placeholder si pas d'URL
  const imageUri = dish.photo || `https://via.placeholder.com/300x300/6270ff/ffffff?text=${encodeURIComponent(dish.name)}`;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!showButton}
      >
        <LinearGradient
          colors={['#151a2d', '#1e2440']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.content}>
            <Text style={styles.name} numberOfLines={2}>
              {dish.name}
            </Text>
            {dish.description && (
              <Text style={styles.description} numberOfLines={2}>
                {dish.description}
              </Text>
            )}
            <View style={styles.footer}>
              <Text style={styles.price}>{dish.price?.toFixed(2)} €</Text>
              {showButton && (
                <TouchableOpacity
                  onPress={handleAddToCart}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#6270ff', '#7c8aff']}
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>Ajouter</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#1e2440',
  },
  content: {
    padding: 16,
  },
  name: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    color: '#9fb5ff',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
