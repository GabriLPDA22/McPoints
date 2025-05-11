import React from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="relative z-10 mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar número..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3.5 px-12 text-white focus:outline-none focus:border-fuchsia-500 placeholder-zinc-500"
          maxLength={4}
        />
        <Search className="absolute left-4 top-4 h-5 w-5 text-zinc-500" />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-4 top-4"
          >
            <X className="h-5 w-5 text-zinc-500 hover:text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
