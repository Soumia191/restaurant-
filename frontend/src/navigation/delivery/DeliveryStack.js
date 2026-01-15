import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DeliveryOrdersScreen from '../../screens/delivery/DeliveryOrdersScreen';

const Stack = createNativeStackNavigator();

export default function DeliveryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DeliveryOrders" component={DeliveryOrdersScreen} />
    </Stack.Navigator>
  );
}
