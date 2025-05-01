import React from "react";
import { Grid, Check, Clock } from "lucide-react";
import "../styles/FilterTabs.css";

const FilterTabs = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { key: "all", label: "Todos", icon: Grid },
    { key: "collected", label: "Coleccionados", icon: Check },
    { key: "missing", label: "Pendientes", icon: Clock },
  ];

  return (
    <div className="filter-tabs">
      {filters.map((filter) => {
        const FilterIcon = filter.icon;
        return (
          <button
            key={filter.key}
            className={`filter-tab ${
              currentFilter === filter.key ? "active" : ""
            }`}
            onClick={() => onFilterChange(filter.key)}
          >
            <FilterIcon className="filter-icon" />
            <span className="tab-label">{filter.label}</span>
            {currentFilter === filter.key && (
              <span className="active-indicator" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FilterTabs;
