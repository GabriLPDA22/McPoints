import React from 'react';
import NumberItem from './NumberItem.jsx';
import '../styles/NumberGrid.css';

const NumberGrid = ({ numbers, onToggleNumber, collectedNumbers }) => {
  return (
    <div className="number-grid-container">
      <div className="number-grid">
        {numbers.map(number => (
          <NumberItem
            key={number}
            number={number}
            isCollected={collectedNumbers[number]}
            onToggle={() => onToggleNumber(number)}
          />
        ))}
      </div>
    </div>
  );
};

export default NumberGrid;
