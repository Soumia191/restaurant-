import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateReservationStatus } from '../../store/reservationSlice';
import api from '../../services/api';

export default function ManageReservationsScreen() {
  const { list } = useSelector((s) => s.reservations);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/reservations');
        dispatch({ type: 'reservations/setReservations', payload: data });
      } catch (e) {
        console.warn('Fetch reservations error', e?.response?.data || e.message);
      }
    })();
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gérer les réservations</Text>
      <FlatList
        data={list}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.text}>{item.name} - {item.date} - {item.type}</Text>
            <Text style={[styles.text, { color:'#9fb5ff' }]}>{item.status}</Text>
            <View style={{ flexDirection:'row' }}>
              <TouchableOpacity style={styles.btn} onPress={() => {
                api.put(`/reservations/${item.id}/status`, { status:'CONFIRMED' })
                  .then(({ data }) => dispatch(updateReservationStatus({ id:data.id, status:data.status })))
                  .catch((e) => console.warn('Update reservation error', e?.response?.data || e.message));
              }}><Text style={{ color:'#fff' }}>Confirmer</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor:'#3a1a1a' }]} onPress={() => {
                api.put(`/reservations/${item.id}/status`, { status:'CANCELLED' })
                  .then(({ data }) => dispatch(updateReservationStatus({ id:data.id, status:data.status })))
                  .catch((e) => console.warn('Update reservation error', e?.response?.data || e.message));
              }}><Text style={{ color:'#fff' }}>Annuler</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0b0f1a', padding:16 },
  title: { color:'#fff', fontSize:20, fontWeight:'800', marginBottom:12 },
  row: { backgroundColor:'#151a2d', padding:12, borderRadius:12, marginVertical:6 },
  text: { color:'#fff' },
  btn: { backgroundColor:'#2b355e', padding:8, borderRadius:8, marginHorizontal:6 }
});
