import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart, Award, CheckCircle } from "lucide-react";

const StatsScreen = ({ collectedNumbers }) => {
  const navigate = useNavigate();

  // Calcular estadísticas para 10000 números
  const totalNumbers = 10000;
  const collectedCount = Object.values(collectedNumbers).filter(Boolean).length;
  const pendingCount = totalNumbers - collectedCount;
  const percentage = Math.round((collectedCount / totalNumbers) * 100);

  // Calcular distribución por rango (ahora con 10 rangos de 1000 números cada uno)
  const getCountByRange = (start, end) => {
    let count = 0;
    for (let i = start; i <= end; i++) {
      const numStr = i.toString().padStart(4, "0");
      if (collectedNumbers[numStr]) {
        count++;
      }
    }
    return count;
  };

  const ranges = [
    { name: "0000-0999", count: getCountByRange(0, 999), total: 1000 },
    { name: "1000-1999", count: getCountByRange(1000, 1999), total: 1000 },
    { name: "2000-2999", count: getCountByRange(2000, 2999), total: 1000 },
    { name: "3000-3999", count: getCountByRange(3000, 3999), total: 1000 },
    { name: "4000-4999", count: getCountByRange(4000, 4999), total: 1000 },
    { name: "5000-5999", count: getCountByRange(5000, 5999), total: 1000 },
    { name: "6000-6999", count: getCountByRange(6000, 6999), total: 1000 },
    { name: "7000-7999", count: getCountByRange(7000, 7999), total: 1000 },
    { name: "8000-8999", count: getCountByRange(8000, 8999), total: 1000 },
    { name: "9000-9999", count: getCountByRange(9000, 9999), total: 1000 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header futurista */}
      <header className="relative bg-zinc-900 p-5 pt-8 overflow-hidden">
        {/* Elementos decorativos - formas geométricas neón */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-10 right-10 w-28 h-28 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 blur-xl opacity-30"></div>
          <div className="absolute -bottom-20 -left-10 w-40 h-40 bg-gradient-to-r from-cyan-400 to-indigo-500 blur-xl opacity-20"></div>
        </div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <button
            className="bg-zinc-800 border border-zinc-700 p-2 rounded-lg flex items-center justify-center text-white hover:border-fuchsia-500"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500">
            Estadísticas
          </h1>
          <div className="w-8"></div> {/* Spacer para centrar el título */}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {/* Círculo de progreso */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 mb-6">
          <div className="flex justify-center mb-6">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Fondo del círculo */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="10"
                />

                {/* Progreso */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#gradientProgress)"
                  strokeWidth="10"
                  strokeDasharray={`${percentage * 2.83} 283`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />

                {/* Gradiente para el círculo */}
                <defs>
                  <linearGradient
                    id="gradientProgress"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#c026d3" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </linearGradient>
                </defs>

                {/* Texto de porcentaje */}
                <text
                  x="50"
                  y="50"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  className="text-3xl font-bold"
                  fill="white"
                  fontSize="18"
                >
                  {percentage}%
                </text>

                {/* Texto de "completado" */}
                <text
                  x="50"
                  y="65"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  className="text-xs"
                  fill="#a1a1aa"
                  fontSize="8"
                >
                  completado
                </text>
              </svg>
            </div>
          </div>

          <div className="flex justify-between">
            <div className="flex-1 flex flex-col items-center bg-zinc-900 border border-zinc-800 p-4 rounded-xl mr-2">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-purple-500">
                {collectedCount}
              </span>
              <span className="text-zinc-400 text-sm">Coleccionados</span>
            </div>
            <div className="flex-1 flex flex-col items-center bg-zinc-900 border border-zinc-800 p-4 rounded-xl ml-2">
              <span className="text-2xl font-bold text-zinc-300">
                {pendingCount}
              </span>
              <span className="text-zinc-400 text-sm">Pendientes</span>
            </div>
          </div>
        </div>

        {/* Distribución por rangos */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-fuchsia-500" />
            Distribución por rangos
          </h2>

          <div className="space-y-4">
            {ranges.map((range) => {
              const rangePercentage = Math.round(
                (range.count / range.total) * 100
              );

              return (
                <div key={range.name} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-zinc-300">
                      {range.name}
                    </span>
                    <span className="text-sm text-zinc-400">
                      {range.count}/{range.total}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-full"
                      style={{ width: `${rangePercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logros */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-fuchsia-500" />
            Logros
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Logros desbloqueados y bloqueados */}
            <div
              className={`p-4 rounded-xl border ${
                collectedCount >= 10
                  ? "bg-gradient-to-br from-fuchsia-900 to-purple-900 border-fuchsia-500/30 shadow-[0_0_10px_rgba(192,38,211,0.2)]"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                  collectedCount >= 10
                    ? "bg-gradient-to-r from-fuchsia-600 to-purple-600"
                    : "bg-zinc-800"
                }`}
              >
                <CheckCircle
                  className={`h-6 w-6 ${
                    collectedCount >= 10 ? "text-white" : "text-zinc-600"
                  }`}
                />
              </div>
              <h3
                className={`font-bold text-center ${
                  collectedCount >= 10 ? "text-white" : "text-zinc-500"
                }`}
              >
                Principiante
              </h3>
              <p
                className={`text-xs text-center mt-1 ${
                  collectedCount >= 10 ? "text-fuchsia-200" : "text-zinc-600"
                }`}
              >
                Colecciona 10 números
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                collectedCount >= 100
                  ? "bg-gradient-to-br from-fuchsia-900 to-purple-900 border-fuchsia-500/30 shadow-[0_0_10px_rgba(192,38,211,0.2)]"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                  collectedCount >= 100
                    ? "bg-gradient-to-r from-fuchsia-600 to-purple-600"
                    : "bg-zinc-800"
                }`}
              >
                <CheckCircle
                  className={`h-6 w-6 ${
                    collectedCount >= 100 ? "text-white" : "text-zinc-600"
                  }`}
                />
              </div>
              <h3
                className={`font-bold text-center ${
                  collectedCount >= 100 ? "text-white" : "text-zinc-500"
                }`}
              >
                Coleccionista
              </h3>
              <p
                className={`text-xs text-center mt-1 ${
                  collectedCount >= 100 ? "text-fuchsia-200" : "text-zinc-600"
                }`}
              >
                Colecciona 100 números
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                collectedCount >= 1000
                  ? "bg-gradient-to-br from-fuchsia-900 to-purple-900 border-fuchsia-500/30 shadow-[0_0_10px_rgba(192,38,211,0.2)]"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                  collectedCount >= 1000
                    ? "bg-gradient-to-r from-fuchsia-600 to-purple-600"
                    : "bg-zinc-800"
                }`}
              >
                <CheckCircle
                  className={`h-6 w-6 ${
                    collectedCount >= 1000 ? "text-white" : "text-zinc-600"
                  }`}
                />
              </div>
              <h3
                className={`font-bold text-center ${
                  collectedCount >= 1000 ? "text-white" : "text-zinc-500"
                }`}
              >
                Experto
              </h3>
              <p
                className={`text-xs text-center mt-1 ${
                  collectedCount >= 1000 ? "text-fuchsia-200" : "text-zinc-600"
                }`}
              >
                Colecciona 1000 números
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                collectedCount >= 5000
                  ? "bg-gradient-to-br from-fuchsia-900 to-purple-900 border-fuchsia-500/30 shadow-[0_0_10px_rgba(192,38,211,0.2)]"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                  collectedCount >= 5000
                    ? "bg-gradient-to-r from-fuchsia-600 to-purple-600"
                    : "bg-zinc-800"
                }`}
              >
                <CheckCircle
                  className={`h-6 w-6 ${
                    collectedCount >= 5000 ? "text-white" : "text-zinc-600"
                  }`}
                />
              </div>
              <h3
                className={`font-bold text-center ${
                  collectedCount >= 5000 ? "text-white" : "text-zinc-500"
                }`}
              >
                Maestro
              </h3>
              <p
                className={`text-xs text-center mt-1 ${
                  collectedCount >= 5000 ? "text-fuchsia-200" : "text-zinc-600"
                }`}
              >
                Colecciona 5000 números
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsScreen;
