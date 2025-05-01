import React from "react";
import { Search, X } from "lucide-react";
import "../styles/SearchBar.css";

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="search-container">
      <div className="search-bar">
        <Search className="search-icon" />

        <input
          className="search-input"
          placeholder="Buscar número..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type="text"
          maxLength={3}
        />

        {/* Botón de limpiar búsqueda */}
        {value && (
          <button
            className="clear-button"
            onClick={() => onChange("")}
            aria-label="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
