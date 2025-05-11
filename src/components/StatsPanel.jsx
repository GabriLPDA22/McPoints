import React from "react";
import { BarChart } from "lucide-react";

const StatsPanel = ({ collected, total }) => {
  const percentage = Math.round((collected / total) * 100);

  return (
    <div className="mx-4 mb-4">
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-bold">Tu progreso</h2>
            <p className="text-zinc-400 text-sm">Sigue coleccionando</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-lg">
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-500">
              {collected}/{total}
            </span>
          </div>
        </div>
        <div className="h-3 bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
