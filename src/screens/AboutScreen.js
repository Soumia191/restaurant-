import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>About ABY Chefs</Text>
        <Text style={styles.text}>
          Our restaurant offers a unique and delicious fusion of flavors from around the world.
          Our menu features dishes from Italy, Japan, Morocco, Mexico, and France.
        </Text>
        <Text style={styles.text}>
          Enjoy the rich flavors of Italian pasta dishes, the delicate flavors of Japanese sushi,
          the exotic spices of Moroccan tagines, the vibrant colors of Mexican tacos, and the
          classic French cuisine.
        </Text>
        <Text style={styles.text}>
          Our restaurant is sure to tantalize your taste buds with a variety of flavors from
          around the world.
        </Text>
        <View style={styles.contact}>
          <Text style={styles.contactTitle}>Contact Us</Text>
          <Text style={styles.contactText}>Email: abychefs@gmail.com</Text>
          <Text style={styles.contactText}>Phone: +212 635904715</Text>
          <Text style={styles.contactText}>
            Address: Aby chefs Restaurant St, Boulevard El Fida, Casablanca 9578, Morocco
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 15,
  },
  contact: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d4a574',
    marginBottom: 15,
  },
  contactText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
});
