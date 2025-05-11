import React from "react";
import { CheckCircle } from "lucide-react";

const NumberItem = ({ number, isCollected, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      className={`aspect-square flex items-center justify-center rounded-xl relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer ${
        isCollected
          ? 'bg-gradient-to-br from-fuchsia-600 to-purple-800 border border-fuchsia-500/30'
          : 'bg-zinc-800 border border-zinc-700 hover:border-zinc-600'
      }`}
    >
      {/* Efectos de iluminación */}
      {isCollected && (
        <>
          <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-600 to-purple-600 opacity-30 blur-md group-hover:opacity-50 transition-opacity"></div>
          <div className="absolute inset-0.5 rounded-lg bg-gradient-to-br from-fuchsia-600 to-purple-800 z-10"></div>
        </>
      )}

      <span className={`text-xl font-bold relative z-20 ${isCollected ? 'text-white' : 'text-gray-300'}`}>
        {number}
      </span>

      {/* Indicador de coleccionado */}
      {isCollected && (
        <div className="absolute top-2 right-2 z-20">
          <CheckCircle className="h-5 w-5 text-white" />
        </div>
      )}
    </div>
  );
};

export default NumberItem;
