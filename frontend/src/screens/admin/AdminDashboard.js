import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import Header from '../../components/Header';

/**
 * Dashboard Admin - Vue d'ensemble avec statistiques et navigation rapide
 */
export default function AdminDashboard() {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    dishes: 0,
    reservations: 0,
    orders: 0,
    tables: { total: 0, available: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [dishesRes, reservationsRes, ordersRes, tablesRes, statsRes] = await Promise.all([
        api.get('/dishes'),
        api.get('/reservations'),
        api.get('/orders'),
        api.get('/tables'),
        api.get('/stats').catch(() => ({ data: { overview: { revenue: 0 } } })) // Ignorer l'erreur si l'endpoint n'existe pas
      ]);

      const availableTables = tablesRes.data.filter(t => t.available).length;

      setStats({
        dishes: dishesRes.data.length,
        reservations: reservationsRes.data.length,
        orders: ordersRes.data.length,
        tables: {
          total: tablesRes.data.length,
          available: availableTables
        },
        revenue: statsRes.data?.overview?.revenue || 0
      });
    } catch (e) {
      console.warn('Error loading stats', e);
      // Fallback si l'endpoint stats n'existe pas encore
      const [dishesRes, reservationsRes, ordersRes, tablesRes] = await Promise.all([
        api.get('/dishes'),
        api.get('/reservations'),
        api.get('/orders'),
        api.get('/tables')
      ]);

      const availableTables = tablesRes.data.filter(t => t.available).length;

      setStats({
        dishes: dishesRes.data.length,
        reservations: reservationsRes.data.length,
        orders: ordersRes.data.length,
        tables: {
          total: tablesRes.data.length,
          available: availableTables
        },
        revenue: 0,
        recentOrders: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      id: 'menu',
      title: 'Gérer le Menu',
      subtitle: `${stats.dishes} plat${stats.dishes > 1 ? 's' : ''}`,
      icon: 'restaurant',
      color: ['#6270ff', '#7c8aff'],
      screen: 'ManageMenu'
    },
    {
      id: 'orders',
      title: 'Gérer les Commandes',
      subtitle: `${stats.orders} commande${stats.orders > 1 ? 's' : ''}`,
      icon: 'cube',
      color: ['#ffd43b', '#ffec8c'],
      screen: 'ManageOrders'
    },
    {
      id: 'reservations',
      title: 'Réservations',
      subtitle: `${stats.reservations} réservation${stats.reservations > 1 ? 's' : ''}`,
      icon: 'calendar',
      color: ['#ff6b6b', '#ff8787'],
      screen: 'ManageReservations'
    },
    {
      id: 'tables',
      title: 'Gérer les Tables',
      subtitle: `${stats.tables.available}/${stats.tables.total} disponibles`,
      icon: 'grid',
      color: ['#51cf66', '#69db7c'],
      screen: 'ManageTables'
    }
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6270ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Header 
        title="Administration" 
        subtitle="Gérez votre restaurant en toute simplicité"
      />

      {/* Statistiques */}
      <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.statsContainer}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={['#6270ff', '#7c8aff']}
            style={styles.statGradient}
          >
            <Ionicons name="restaurant" size={32} color="#fff" />
            <Text style={styles.statValue}>{stats.dishes}</Text>
            <Text style={styles.statLabel}>Plats</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['#ff6b6b', '#ff8787']}
            style={styles.statGradient}
          >
            <Ionicons name="calendar" size={32} color="#fff" />
            <Text style={styles.statValue}>{stats.reservations}</Text>
            <Text style={styles.statLabel}>Réservations</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['#51cf66', '#69db7c']}
            style={styles.statGradient}
          >
            <Ionicons name="cube" size={32} color="#fff" />
            <Text style={styles.statValue}>{stats.orders}</Text>
            <Text style={styles.statLabel}>Commandes</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['#ffd43b', '#ffec8c']}
            style={styles.statGradient}
          >
            <Ionicons name="grid" size={32} color="#fff" />
            <Text style={styles.statValue}>{stats.tables.available}</Text>
            <Text style={styles.statLabel}>Tables libres</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['#51cf66', '#69db7c']}
            style={styles.statGradient}
          >
            <Ionicons name="cash" size={32} color="#fff" />
            <Text style={styles.statValue}>{stats.revenue?.toFixed(2) || '0.00'}</Text>
            <Text style={styles.statLabel}>Revenus (€)</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['#ff8787', '#ffa8a8']}
            style={styles.statGradient}
          >
            <Ionicons name="time" size={32} color="#fff" />
            <Text style={styles.statValue}>{stats.recentOrders || 0}</Text>
            <Text style={styles.statLabel}>Commandes (7j)</Text>
          </LinearGradient>
        </View>
      </Animated.View>

      {/* Menu de navigation */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInDown.delay(200 + index * 100).duration(600)}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate(item.screen)}
              style={styles.menuItem}
            >
              <LinearGradient
                colors={item.color}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.menuGradient}
              >
                <View style={styles.menuContent}>
                  <Ionicons name={item.icon} size={32} color="#fff" />
                  <View style={styles.menuText}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
  },
  statLabel: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
  menuContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  menuItem: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuGradient: {
    padding: 20,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  menuSubtitle: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
  },
});
