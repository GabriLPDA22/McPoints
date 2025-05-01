import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatsScreen = ({ collectedNumbers }) => {
  // Aquí podrías añadir estadísticas más detalladas
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estadísticas Detalladas</Text>
      {/* Contenido de estadísticas */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default StatsScreen;