import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/StatsScreen.css';

const StatsScreen = ({ collectedNumbers }) => {
  const navigate = useNavigate();

  // Calcular estadísticas
  const totalNumbers = 1000;
  const collectedCount = Object.values(collectedNumbers).filter(Boolean).length;
  const pendingCount = totalNumbers - collectedCount;
  const percentage = Math.round((collectedCount / totalNumbers) * 100);

  // Calcular distribución por rango
  const getCountByRange = (start, end) => {
    let count = 0;
    for (let i = start; i <= end; i++) {
      const numStr = i.toString().padStart(3, "0");
      if (collectedNumbers[numStr]) {
        count++;
      }
    }
    return count;
  };

  const ranges = [
    { name: "000-099", count: getCountByRange(0, 99) },
    { name: "100-199", count: getCountByRange(100, 199) },
    { name: "200-299", count: getCountByRange(200, 299) },
    { name: "300-399", count: getCountByRange(300, 399) },
    { name: "400-499", count: getCountByRange(400, 499) },
    { name: "500-599", count: getCountByRange(500, 599) },
    { name: "600-699", count: getCountByRange(600, 699) },
    { name: "700-799", count: getCountByRange(700, 799) },
    { name: "800-899", count: getCountByRange(800, 899) },
    { name: "900-999", count: getCountByRange(900, 999) },
  ];

  return (
    <div className="stats-screen">
      <header className="stats-header">
        <button className="back-button" onClick={() => navigate("/")}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          <span>Volver</span>
        </button>
        <h1>Estadísticas</h1>
      </header>

      <div className="stats-content">
        <div className="main-stats-card">
          <div className="circle-progress">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className="circle-bg" />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="circle-progress-bar"
                style={{
                  strokeDasharray: `${percentage * 2.83}, 283`,
                  strokeDashoffset: 0,
                }}
              />
              <text x="50" y="50" className="circle-text">
                {percentage}%
              </text>
            </svg>
          </div>

          <div className="stats-summary">
            <div className="stat-box">
              <span className="stat-value">{collectedCount}</span>
              <span className="stat-label">Coleccionados</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-box">
              <span className="stat-value">{pendingCount}</span>
              <span className="stat-label">Pendientes</span>
            </div>
          </div>
        </div>

        <h2 className="section-title">Distribución por Rango</h2>

        <div className="ranges-container">
          {ranges.map((range) => (
            <div className="range-item" key={range.name}>
              <div className="range-header">
                <span className="range-name">{range.name}</span>
                <span className="range-count">{range.count}/100</span>
              </div>
              <div className="range-progress-bar">
                <div
                  className="range-progress"
                  style={{ width: `${range.count}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsScreen;
