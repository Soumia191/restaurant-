import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      if (user?.email) {
        const data = await orderAPI.getUserOrders(user.email);
        // Group orders by num_commande
        const grouped = data.reduce((acc, order) => {
          if (!acc[order.num_commande]) {
            acc[order.num_commande] = [];
          }
          acc[order.num_commande].push(order);
          return acc;
        }, {});
        setOrders(Object.entries(grouped));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const renderOrder = ({ item }) => {
    const [numCommande, items] = item;
    const total = items.reduce((sum, order) => sum + parseFloat(order.price), 0);

    return (
      <View style={styles.orderCard}>
        <Text style={styles.orderNumber}>Order: {numCommande}</Text>
        <Text style={styles.orderDate}>
          {items[0]?.hour_o ? new Date(items[0].hour_o).toLocaleDateString() : 'N/A'}
        </Text>
        {items.map((orderItem, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.orderItemName}>{orderItem.name_p}</Text>
            <Text style={styles.orderItemDetails}>
              {orderItem.quantite}x {orderItem.price_u} MAD = {orderItem.price} MAD
            </Text>
          </View>
        ))}
        <View style={styles.orderTotal}>
          <Text style={styles.orderTotalText}>Total: {total.toFixed(2)} MAD</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>Loading orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No orders yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item[0]}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
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
  orderCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  orderItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  orderItemDetails: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#d4a574',
  },
  orderTotalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d4a574',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
});
