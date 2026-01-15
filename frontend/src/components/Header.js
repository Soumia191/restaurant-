import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { logout } from '../store/authSlice';
import { logout as logoutService } from '../services/auth';

/**
 * Composant Header réutilisable avec bouton de déconnexion
 */
export default function Header({ title, subtitle, showLogout = true, rightComponent }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            logoutService();
            dispatch(logout());
            // La navigation sera gérée automatiquement par AuthNavigator
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {user?.name && (
            <Text style={styles.userName}>Bonjour, {user.name}</Text>
          )}
        </View>
        <View style={styles.rightContainer}>
          {rightComponent}
          {showLogout && (
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#ff6b6b', '#ff8787']}
                style={styles.logoutGradient}
              >
                <Ionicons name="log-out-outline" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0b0f1a',
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2440',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 3,
  },
  subtitle: {
    color: '#9fb5ff',
    fontSize: 12,
    marginTop: 2,
  },
  userName: {
    color: '#6270ff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  logoutButton: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutGradient: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
