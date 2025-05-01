import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NumberGrid from '../components/NumberGrid';
import SearchBar from '../components/SearchBar';
import StatsPanel from '../components/StatsPanel';
import FilterTabs from '../components/FilterTabs';
import { saveData } from '../utils/storage';
import '../styles/HomeScreen.css';

const HomeScreen = ({ collectedNumbers, setCollectedNumbers }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const navigate = useNavigate();

  // Alternar estado de un número
  const toggleNumber = (number) => {
    const newNumbers = { ...collectedNumbers };
    newNumbers[number] = !newNumbers[number];
    setCollectedNumbers(newNumbers);
    saveData('collectedNumbers', newNumbers);
  };

  // Generar números filtrados
  const getFilteredNumbers = () => {
    const numbers = [];
    for (let i = 0; i <= 999; i++) {
      const numStr = i.toString().padStart(3, '0');

      // Aplicar filtro de búsqueda
      if (searchQuery && !numStr.includes(searchQuery)) {
        continue;
      }

      // Aplicar filtro de estado
      if (
        (currentFilter === 'all') ||
        (currentFilter === 'collected' && collectedNumbers[numStr]) ||
        (currentFilter === 'missing' && !collectedNumbers[numStr])
      ) {
        numbers.push(numStr);
      }
    }
    return numbers;
  };

  // Contar números coleccionados
  const getCollectedCount = () => {
    return Object.values(collectedNumbers).filter(Boolean).length;
  };

  const filteredNumbers = getFilteredNumbers();
  const collectedCount = getCollectedCount();

  return (
    <div className="home-screen">
      <header>
        <h1>MacPoints</h1>
        <button onClick={() => navigate('/stats')}>Estadísticas</button>
      </header>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <StatsPanel collected={collectedCount} total={1000} />

      <FilterTabs currentFilter={currentFilter} onFilterChange={setCurrentFilter} />

      <NumberGrid
        numbers={filteredNumbers}
        onToggleNumber={toggleNumber}
        collectedNumbers={collectedNumbers}
      />
    </div>
  );
};

export default HomeScreen;
