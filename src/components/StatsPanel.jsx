import React from "react";
import { BarChart2 } from "lucide-react";
import "../styles/StatsPanel.css";

const StatsPanel = ({ collected, total }) => {
  const percentage = Math.round((collected / total) * 100);

  return (
    <div className="stats-panel">
      <h2 className="stats-title">
        <BarChart2 className="stats-icon" />
        Estadísticas
      </h2>
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-label">Coleccionados:</span>
          <span className="stat-value">
            {collected}/{total}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Progreso:</span>
          <span className="stat-value">{percentage}%</span>
        </div>
      </div>
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress" style={{ width: percentage + "%" }}>
            {percentage > 5 && (
              <span className="progress-label">{percentage}%</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
