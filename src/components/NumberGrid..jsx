import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import NumberItem from './NumberItem';

const NumberGrid = ({ numbers, onToggleNumber, collectedNumbers }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={numbers}
        renderItem={({ item }) => (
          <NumberItem 
            number={item} 
            isCollected={collectedNumbers[item]} 
            onToggle={() => onToggleNumber(item)} 
          />
        )}
        keyExtractor={item => item}
        numColumns={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default NumberGrid;