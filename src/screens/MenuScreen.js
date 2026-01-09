import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { menuAPI } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';

export default function MenuScreen() {
  const navigation = useNavigation();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenu();
  }, [activeTab]);

  const loadMenu = async () => {
    setLoading(true);
    try {
      let data = [];
      if (activeTab === 'all') {
        data = await menuAPI.getAll();
      } else if (activeTab === 'main') {
        data = await menuAPI.getMain();
      } else if (activeTab === 'drinks') {
        data = await menuAPI.getDrinks();
      } else if (activeTab === 'pastry') {
        data = await menuAPI.getPastry();
      }
      setItems(data);
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item);
  };

  const renderItem = ({ item }) => (
    <View style={styles.menuItem}>
      <View style={styles.itemImage}>
        <Text style={styles.itemImageText}>{item.name_p.charAt(0)}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name_p}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <View style={styles.itemFooter}>
          <Text style={styles.itemPrice}>{item.price} MAD</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'main' && styles.activeTab]}
          onPress={() => setActiveTab('main')}
        >
          <Text style={[styles.tabText, activeTab === 'main' && styles.activeTabText]}>
            Main
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'drinks' && styles.activeTab]}
          onPress={() => setActiveTab('drinks')}
        >
          <Text style={[styles.tabText, activeTab === 'drinks' && styles.activeTabText]}>
            Drinks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pastry' && styles.activeTab]}
          onPress={() => setActiveTab('pastry')}
        >
          <Text style={[styles.tabText, activeTab === 'pastry' && styles.activeTabText]}>
            Pastry
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id_p}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#d4a574',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#d4a574',
    fontWeight: 'bold',
  },
  list: {
    padding: 15,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  itemImage: {
    width: 120,
    height: 120,
    backgroundColor: '#d4a574',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d4a574',
  },
  addButton: {
    backgroundColor: '#d4a574',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
