import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const NumberItem = ({ number, isCollected, onToggle }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, isCollected && styles.collected]} 
      onPress={onToggle}
    >
      <Text style={[styles.text, isCollected && styles.collectedText]}>
        {number}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 5,
    padding: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  collected: {
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  collectedText: {
    color: 'white',
  },
});

export default NumberItem;