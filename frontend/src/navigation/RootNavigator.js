import React, { useEffect, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ClientTabs from './client/ClientTabs';
import AdminStack from './admin/AdminStack';
import DeliveryStack from './delivery/DeliveryStack';

const Stack = createNativeStackNavigator();

// Composant pour gérer la navigation basée sur l'authentification
function AuthNavigator() {
  const { user } = useSelector((state) => state.auth);
  const navigation = useNavigation();
  const prevUserRef = useRef(user);

  useEffect(() => {
    const prevUser = prevUserRef.current;
    
    // Si l'utilisateur vient de se connecter (passage de null à un utilisateur)
    if (!prevUser && user && user.role) {
      let routeName = 'Login';
      
      if (user.role === 'CLIENT') {
        routeName = 'Client';
      } else if (user.role === 'ADMIN') {
        routeName = 'Admin';
      } else if (user.role === 'LIVREUR') {
        routeName = 'Delivery';
      }
      
      navigation.reset({
        index: 0,
        routes: [{ name: routeName }],
      });
    }
    // Si l'utilisateur vient de se déconnecter (passage d'un utilisateur à null)
    else if (prevUser && !user) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
    
    prevUserRef.current = user;
  }, [user, navigation]);

  return null;
}

export default function RootNavigator() {
  const { user } = useSelector((state) => state.auth);

  // Déterminer l'écran initial basé sur le rôle de l'utilisateur
  const getInitialRouteName = () => {
    if (!user || !user.role) return 'Login';
    if (user.role === 'CLIENT') return 'Client';
    if (user.role === 'ADMIN') return 'Admin';
    if (user.role === 'LIVREUR') return 'Delivery';
    return 'Login';
  };

  return (
    <>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={getInitialRouteName()}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Client" component={ClientTabs} />
        <Stack.Screen name="Admin" component={AdminStack} />
        <Stack.Screen name="Delivery" component={DeliveryStack} />
      </Stack.Navigator>
      <AuthNavigator />
    </>
  );
}
