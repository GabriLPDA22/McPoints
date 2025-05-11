import React from 'react';
import NumberItem from './NumberItem.jsx';

const NumberGrid = ({ numbers, onToggleNumber, collectedNumbers }) => {
  if (numbers.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-8 shadow-lg max-w-xs">
          <div className="text-fuchsia-500 mb-3 text-3xl">🔍</div>
          <h3 className="text-lg font-bold text-white mb-2">No se encontraron números</h3>
          <p className="text-zinc-400">Prueba cambiando los filtros o la búsqueda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="grid grid-cols-3 gap-3">
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
