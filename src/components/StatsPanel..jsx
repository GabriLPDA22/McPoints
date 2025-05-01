import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatsPanel = ({ collected, total }) => {
  const percentage = Math.round((collected / total) * 100);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estadísticas</Text>
      <View style={styles.statsRow}>
        <Text style={styles.statText}>Coleccionados: {collected}/{total}</Text>
        <Text style={styles.statText}>Progreso: {percentage}%</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: ${percentage}% }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statText: {
    fontSize: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
});

export default StatsPanel;