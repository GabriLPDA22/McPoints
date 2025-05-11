import React from "react";
import { Grid, CheckCircle, Clock } from "lucide-react";

const FilterTabs = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { key: "all", label: "Todos", icon: Grid },
    { key: "collected", label: "Coleccionados", icon: CheckCircle },
    { key: "missing", label: "Pendientes", icon: Clock },
  ];

  return (
    <div className="flex mx-4 mb-4 bg-zinc-800 border border-zinc-700 rounded-xl p-1.5">
      {filters.map((filter) => {
        const FilterIcon = filter.icon;
        return (
          <button
            key={filter.key}
            className={`flex-1 py-3 px-4 rounded-lg flex flex-col items-center justify-center ${
              currentFilter === filter.key
                ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-medium'
                : 'text-zinc-400 font-medium hover:text-white transition-colors'
            }`}
            onClick={() => onFilterChange(filter.key)}
          >
            <FilterIcon className="h-5 w-5 mb-1" />
            <span className="text-sm">{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default FilterTabs;
