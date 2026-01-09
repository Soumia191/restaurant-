import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BookingScreen() {
  const { user } = useAuth();
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [numberOfPeople, setNumberOfPeople] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const data = await bookingAPI.getTables();
      setTables(data);
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to make a reservation');
      return;
    }

    if (!selectedTable) {
      Alert.alert('Error', 'Please select a table');
      return;
    }

    if (!numberOfPeople || parseInt(numberOfPeople) > 6) {
      Alert.alert('Error', 'Number of people must be between 1 and 6');
      return;
    }

    try {
      await bookingAPI.createBooking({
        nameUser: user.name,
        email: user.email,
        tableId: selectedTable,
        numberOfPeople: parseInt(numberOfPeople),
        reservationDate: date.toISOString().split('T')[0],
        reservationTime: time.toTimeString().split(' ')[0].substring(0, 5),
      });

      Alert.alert('Success', 'Table reserved successfully!');
      setSelectedTable(null);
      setNumberOfPeople('');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to make reservation');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Book a Table</Text>
        <Text style={styles.subtitle}>Select a table and time</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Number of People (max 6)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter number of people"
          value={numberOfPeople}
          onChangeText={setNumberOfPeople}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Select Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {date.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {showDatePicker && Platform.OS === 'ios' && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
              minimumDate={new Date()}
            />
          </View>
        )}
        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) setDate(selectedDate);
            }}
            minimumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Select Time</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {time.toLocaleTimeString().substring(0, 5)}
          </Text>
        </TouchableOpacity>
        {showTimePicker && Platform.OS === 'ios' && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) setTime(selectedTime);
              }}
            />
          </View>
        )}
        {showTimePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (selectedTime) setTime(selectedTime);
            }}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Available Tables</Text>
        <View style={styles.tablesGrid}>
          {tables.map((table) => (
            <TouchableOpacity
              key={table.id_table}
              style={[
                styles.tableButton,
                selectedTable === table.id_table && styles.selectedTable,
              ]}
              onPress={() => setSelectedTable(table.id_table)}
            >
              <Text
                style={[
                  styles.tableButtonText,
                  selectedTable === table.id_table && styles.selectedTableText,
                ]}
              >
                Table {table.id_table}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
        <Text style={styles.bookButtonText}>Confirm Reservation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tableButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    margin: 5,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTable: {
    borderColor: '#d4a574',
    backgroundColor: '#fff5e6',
  },
  tableButtonText: {
    fontSize: 16,
    color: '#666',
  },
  selectedTableText: {
    color: '#d4a574',
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: '#d4a574',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 10,
  },
});
