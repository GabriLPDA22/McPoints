import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const FilterTabs = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'collected', label: 'Coleccionados' },
    { key: 'missing', label: 'Pendientes' },
  ];
  
  return (
    <View style={styles.container}>
      {filters.map(filter => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.tab,
            currentFilter === filter.key && styles.activeTab
          ]}
          onPress={() => onFilterChange(filter.key)}
        >
          <Text style={[
            styles.tabText,
            currentFilter === filter.key && styles.activeTabText
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#E53935',
  },
  tabText: {
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
});

export default FilterTabs;