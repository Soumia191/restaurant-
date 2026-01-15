import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Animated as RNAnimated } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { login } from '../../store/authSlice';
import { registerUser } from '../../services/auth';

/**
 * Écran d'inscription - Création de compte client
 */
export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const scale = new RNAnimated.Value(1);

  const validateForm = () => {
    if (!name.trim()) {
      setError('Le nom est requis');
      return false;
    }
    if (!email.trim()) {
      setError('L\'email est requis');
      return false;
    }
    if (!email.includes('@')) {
      setError('Email invalide');
      return false;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    return true;
  };

  const onRegister = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    RNAnimated.sequence([
      RNAnimated.spring(scale, { toValue: 0.98, useNativeDriver: true }),
      RNAnimated.spring(scale, { toValue: 1, useNativeDriver: true })
    ]).start(async () => {
      try {
        const data = await registerUser(email, password, name);
        console.log('Registration successful, role:', data.role);
        dispatch(login({ 
          email: data.user?.email || email, 
          role: data.role, 
          token: data.token,
          id: data.user?.id,
          name: data.user?.name || name
        }));
        
        // Naviguer vers l'écran client
        navigation.reset({
          index: 0,
          routes: [{ name: 'Client' }],
        });
      } catch (e) {
        const errorMessage = e?.response?.data?.error || e?.message || 'Erreur lors de l\'inscription';
        setError(errorMessage);
        console.warn('Registration error', e?.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez-nous pour commander</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="person" size={20} color="#9fb5ff" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nom complet"
            placeholderTextColor="#9fb5ff"
            value={name}
            onChangeText={(text) => { setName(text); setError(''); }}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color="#9fb5ff" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9fb5ff"
            value={email}
            onChangeText={(text) => { setEmail(text); setError(''); }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={20} color="#9fb5ff" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe (min. 6 caractères)"
            placeholderTextColor="#9fb5ff"
            secureTextEntry
            value={password}
            onChangeText={(text) => { setPassword(text); setError(''); }}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={20} color="#9fb5ff" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe"
            placeholderTextColor="#9fb5ff"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(text) => { setConfirmPassword(text); setError(''); }}
          />
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#ff6b6b" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.registerButton}
          onPress={onRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          <RNAnimated.View style={{ transform: [{ scale }] }}>
            <LinearGradient
              colors={['#6270ff', '#7c8aff']}
              style={styles.registerButtonGradient}
            >
              {loading ? (
                <Text style={styles.registerButtonText}>Inscription...</Text>
              ) : (
                <>
                  <Ionicons name="person-add" size={24} color="#fff" />
                  <Text style={styles.registerButtonText}>S'inscrire</Text>
                </>
              )}
            </LinearGradient>
          </RNAnimated.View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>
            Déjà un compte ? <Text style={styles.loginLinkBold}>Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f1a',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9fb5ff',
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2440',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2b355e',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d1a1a',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    flex: 1,
  },
  registerButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6270ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  registerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 12,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#9fb5ff',
    fontSize: 16,
  },
  loginLinkBold: {
    color: '#6270ff',
    fontWeight: '700',
  },
});
