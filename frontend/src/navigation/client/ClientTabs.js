import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import MenuScreen from '../../screens/client/MenuScreen';
import ReservationScreen from '../../screens/client/ReservationScreen';
import ReservationsHistoryScreen from '../../screens/client/ReservationsHistoryScreen';
import TablesScreen from '../../screens/client/TablesScreen';
import CheckoutScreen from '../../screens/client/CheckoutScreen';
import OrdersHistoryScreen from '../../screens/client/OrdersHistoryScreen';
import OrderDetailsScreen from '../../screens/client/OrderDetailsScreen';
import CartScreen from '../../screens/client/CartScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack pour Menu (MenuScreen + CartScreen + CheckoutScreen)
function MenuStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="MenuList"
    >
      <Stack.Screen 
        name="MenuList" 
        component={MenuScreen}
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen}
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
      />
    </Stack.Navigator>
  );
}

// Stack pour Commandes (OrdersHistoryScreen + OrderDetailsScreen)
function OrdersStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="OrdersHistory"
    >
      <Stack.Screen 
        name="OrdersHistory" 
        component={OrdersHistoryScreen}
      />
      <Stack.Screen 
        name="OrderDetails" 
        component={OrderDetailsScreen}
      />
    </Stack.Navigator>
  );
}

// Stack pour Réservations (ReservationScreen + ReservationsHistoryScreen)
function ReservationsStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="ReservationForm"
    >
      <Stack.Screen 
        name="ReservationForm" 
        component={ReservationScreen}
      />
      <Stack.Screen 
        name="ReservationsHistory" 
        component={ReservationsHistoryScreen}
      />
    </Stack.Navigator>
  );
}

export default function ClientTabs() {
  // Mémoriser les options communes pour éviter les recréations
  const commonScreenOptions = useMemo(() => ({
    headerShown: false,
    tabBarActiveTintColor: '#6270ff',
    tabBarInactiveTintColor: '#9fb5ff',
    tabBarShowLabel: true,
    tabBarStyle: {
      backgroundColor: '#151a2d',
      borderTopColor: '#1e2440',
      borderTopWidth: 1,
      height: 65,
      paddingBottom: 8,
      paddingTop: 8,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600',
    },
  }), []);

  // Options pour chaque écran, définies de manière statique
  const menuOptions = useMemo(() => ({
    tabBarLabel: 'Menu',
    tabBarIcon: ({ focused, color, size }) => (
      <Ionicons 
        name={focused ? 'restaurant' : 'restaurant-outline'} 
        size={size || 24} 
        color={color || '#9fb5ff'} 
      />
    ),
  }), []);

  const tablesOptions = useMemo(() => ({
    tabBarLabel: 'Tables',
    tabBarIcon: ({ focused, color, size }) => (
      <Ionicons 
        name={focused ? 'grid' : 'grid-outline'} 
        size={size || 24} 
        color={color || '#9fb5ff'} 
      />
    ),
  }), []);

  const reservationOptions = useMemo(() => ({
    tabBarLabel: 'Réserver',
    tabBarIcon: ({ focused, color, size }) => (
      <Ionicons 
        name={focused ? 'calendar' : 'calendar-outline'} 
        size={size || 24} 
        color={color || '#9fb5ff'} 
      />
    ),
  }), []);

  const ordersOptions = useMemo(() => ({
    tabBarLabel: 'Commandes',
    tabBarIcon: ({ focused, color, size }) => (
      <Ionicons 
        name={focused ? 'receipt' : 'receipt-outline'} 
        size={size || 24} 
        color={color || '#9fb5ff'} 
      />
    ),
  }), []);

  return (
    <Tab.Navigator
      screenOptions={commonScreenOptions}
      initialRouteName="Menu"
      backBehavior="history"
      detachInactiveScreens={false}
    >
      <Tab.Screen
        name="Menu"
        component={MenuStack}
        options={menuOptions}
      />
      <Tab.Screen
        name="Tables"
        component={TablesScreen}
        options={tablesOptions}
      />
      <Tab.Screen
        name="Reservation"
        component={ReservationsStack}
        options={reservationOptions}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        options={ordersOptions}
      />
    </Tab.Navigator>
  );
}
