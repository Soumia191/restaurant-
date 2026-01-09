import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { menuAPI } from '../services/api';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const [latestItems, setLatestItems] = useState([]);

  useEffect(() => {
    loadLatestItems();
  }, []);

  const loadLatestItems = async () => {
    try {
      const items = await menuAPI.getLatest();
      setLatestItems(items);
    } catch (error) {
      console.error('Error loading latest items:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>ABY Chefs</Text>
        <Text style={styles.heroSubtitle}>Amazing & Delicious Food</Text>
        <TouchableOpacity
          style={styles.heroButton}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.heroButtonText}>View Our Menu</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Story</Text>
        <Text style={styles.sectionText}>
          Our restaurant offers a unique and delicious fusion of flavors from around the world.
          Our menu features dishes from Italy, Japan, Morocco, Mexico, and France.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('About')}
        >
          <Text style={styles.buttonText}>Read More</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Latest Items</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {latestItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.latestCard}
              onPress={() => navigation.navigate('Latest')}
            >
              <View style={styles.latestImage}>
                <Text style={styles.latestImageText}>{item.sentence}</Text>
              </View>
              <Text style={styles.latestText}>{item.sentence}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Choose Us</Text>
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>Hygienic Food</Text>
            <Text style={styles.featureText}>
              We use only the freshest ingredients
            </Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>Fresh Environment</Text>
            <Text style={styles.featureText}>
              Enjoy a fresh and vibrant atmosphere
            </Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>Skilled Chefs</Text>
            <Text style={styles.featureText}>
              Years of experience creating delicious meals
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.bookingButton}
        onPress={() => navigation.navigate('Booking')}
      >
        <Text style={styles.bookingButtonText}>Book A Table</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  hero: {
    backgroundColor: '#d4a574',
    padding: 40,
    alignItems: 'center',
    minHeight: 300,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 30,
  },
  heroButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  heroButtonText: {
    color: '#d4a574',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#d4a574',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  latestCard: {
    width: 200,
    marginRight: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    overflow: 'hidden',
  },
  latestImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#d4a574',
    justifyContent: 'center',
    alignItems: 'center',
  },
  latestImageText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  latestText: {
    padding: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  features: {
    marginTop: 20,
  },
  feature: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d4a574',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bookingButton: {
    backgroundColor: '#d4a574',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookingButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
