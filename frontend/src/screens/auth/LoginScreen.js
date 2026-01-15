import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { login } from '../../store/authSlice';
import { loginUser } from '../../services/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const scale = new Animated.Value(1);

  const onLogin = async () => {
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true })
    ]).start(async () => {
      try {
        const data = await loginUser(email, password);
        console.log('Login successful, role:', data.role);
        dispatch(login({ 
          email: data.user?.email || email, 
          role: data.role, 
          token: data.token,
          id: data.user?.id,
          name: data.user?.name
        }));
        
        // Naviguer vers l'écran approprié selon le rôle
        let routeName = 'Login';
        if (data.role === 'CLIENT') {
          routeName = 'Client';
        } else if (data.role === 'ADMIN') {
          routeName = 'Admin';
        } else if (data.role === 'LIVREUR') {
          routeName = 'Delivery';
        }
        
        navigation.reset({
          index: 0,
          routes: [{ name: routeName }],
        });
      } catch (e) {
        const errorMessage = e?.response?.data?.error || e?.message || 'Erreur inconnue';
        
        if (e?.message === 'Network Error' || e?.code === 'ECONNREFUSED') {
          setError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
          Alert.alert(
            'Erreur de connexion',
            'Le serveur backend ne répond pas.\n\n' +
            'Vérifiez que:\n' +
            '• Le backend est démarré (cd backend && npm run dev)\n' +
            '• Le backend écoute sur le port 4000\n' +
            '• Votre appareil et votre PC sont sur le même WiFi',
            [{ text: 'OK' }]
          );
        } else {
          setError(errorMessage);
        }
        console.warn('Login error', e?.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <Text style={styles.title}>Restauration</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          value={email} 
          onChangeText={(text) => { setEmail(text); setError(''); }}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Mot de passe" 
          secureTextEntry 
          value={password} 
          onChangeText={(text) => { setPassword(text); setError(''); }}
        />
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Text style={{ color:'#9fb5ff', marginVertical:8 }}>Utilisez: admin@resto.com, client@resto.com, livreur@resto.com</Text>
        )}
        <TouchableOpacity style={styles.loginBtn} onPress={onLogin} disabled={loading}>
          <Text style={styles.loginText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerLinkText}>
            Pas encore de compte ? <Text style={styles.registerLinkBold}>S'inscrire</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0b0f1a', alignItems:'center', justifyContent:'center' },
  card: { width:'90%', backgroundColor:'#151a2d', padding:20, borderRadius:16, shadowColor:'#000', shadowOpacity:0.4, shadowRadius:10 },
  title: { color:'#fff', fontSize:28, fontWeight:'800', marginBottom:16 },
  input: { backgroundColor:'#1e2440', color:'#fff', padding:12, borderRadius:10, marginVertical:8 },
  roleRow: { flexDirection:'row', justifyContent:'space-between', marginVertical:12 },
  roleBtn: { flex:1, padding:10, marginHorizontal:4, borderRadius:8, backgroundColor:'#1e2440', alignItems:'center' },
  roleBtnActive: { backgroundColor:'#2b355e' },
  roleText: { color:'#9fb5ff', fontWeight:'600' },
  loginBtn: { backgroundColor:'#6270ff', padding:12, borderRadius:10, marginTop:10, alignItems:'center' },
  loginText: { color:'#fff', fontWeight:'700' },
  errorText: { color:'#ff6b6b', marginVertical:8, fontSize:12, textAlign:'center' }
});
