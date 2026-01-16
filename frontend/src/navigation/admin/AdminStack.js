import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboard from '../../screens/admin/AdminDashboard';
import ManageMenuScreen from '../../screens/admin/ManageMenuScreen';
import ManageReservationsScreen from '../../screens/admin/ManageReservationsScreen';
import ManageTablesScreen from '../../screens/admin/ManageTablesScreen';
import ManageOrdersScreen from '../../screens/admin/ManageOrdersScreen';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="ManageMenu" component={ManageMenuScreen} />
      <Stack.Screen name="ManageReservations" component={ManageReservationsScreen} />
      <Stack.Screen name="ManageTables" component={ManageTablesScreen} />
      <Stack.Screen name="ManageOrders" component={ManageOrdersScreen} />
    </Stack.Navigator>
  );
}
