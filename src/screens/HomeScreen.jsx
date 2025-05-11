import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NumberGrid from "../components/NumberGrid";
import SearchBar from "../components/SearchBar";
import StatsPanel from "../components/StatsPanel";
import FilterTabs from "../components/FilterTabs";
import ScannerModal from "../components/ScannerModal";
import SettingsModal from "../components/SettingsModal";
import { saveData } from "../utils/storage";
import { Star, Search, X, Plus, BarChart, Settings } from 'lucide-react';

const HomeScreen = ({ collectedNumbers, setCollectedNumbers }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("collection");
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const navigate = useNavigate();

  // Alternar estado de un número
  const toggleNumber = (number) => {
    const newNumbers = { ...collectedNumbers };
    newNumbers[number] = !newNumbers[number];
    setCollectedNumbers(newNumbers);
    saveData("collectedNumbers", newNumbers);
  };

  // Generar números filtrados (ahora hasta 9999)
  const getFilteredNumbers = () => {
    const numbers = [];
    for (let i = 0; i <= 9999; i++) {
      const numStr = i.toString().padStart(4, "0");

      // Aplicar filtro de búsqueda
      if (searchQuery && !numStr.includes(searchQuery)) {
        continue;
      }

      // Aplicar filtro de estado
      if (
        currentFilter === "all" ||
        (currentFilter === "collected" && collectedNumbers[numStr]) ||
        (currentFilter === "missing" && !collectedNumbers[numStr])
      ) {
        numbers.push(numStr);
      }
    }
    return numbers;
  };

  // Limitar la cantidad de números mostrados para mejor rendimiento
  const getLimitedFilteredNumbers = () => {
    const allNumbers = getFilteredNumbers();
    return allNumbers.slice(0, 300); // Limitar a 300 para evitar problemas de rendimiento
  };

  // Contar números coleccionados
  const getCollectedCount = () => {
    return Object.values(collectedNumbers).filter(Boolean).length;
  };

  // Manejar clic en el botón de escanear
  const handleScanClick = () => {
    setActiveTab("scanner");
    setShowScannerModal(true);
  };

  // Manejar clic en el botón de ajustes
  const handleSettingsClick = () => {
    setActiveTab("settings");
    setShowSettingsModal(true);
  };

  // Manejar cierre de modal de escaneo
  const handleCloseScannerModal = () => {
    setShowScannerModal(false);
    setActiveTab("collection");
  };

  // Manejar cierre de modal de ajustes
  const handleCloseSettingsModal = () => {
    setShowSettingsModal(false);
    setActiveTab("collection");
  };

  // Manejar número escaneado
  const handleScannedNumber = (number) => {
    if (number && number.length === 4 && !isNaN(number)) {
      const newNumbers = { ...collectedNumbers };
      newNumbers[number] = true;
      setCollectedNumbers(newNumbers);
      saveData("collectedNumbers", newNumbers);
      setShowScannerModal(false);
      setActiveTab("collection");
    }
  };

  const filteredNumbers = getLimitedFilteredNumbers();
  const collectedCount = getCollectedCount();

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header futurista con formas geométricas */}
      <header className="relative bg-zinc-900 p-5 pt-8 overflow-hidden">
        {/* Elementos decorativos - formas geométricas neón */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-10 right-10 w-28 h-28 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 blur-xl opacity-30"></div>
          <div className="absolute -bottom-20 -left-10 w-40 h-40 bg-gradient-to-r from-cyan-400 to-indigo-500 blur-xl opacity-20"></div>
        </div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center">
            <div className="bg-zinc-800 p-2 rounded-lg border border-zinc-700">
              <Star className="text-fuchsia-500 h-6 w-6" />
            </div>
            <h1 className="ml-3 text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500">
              McPoints
            </h1>
          </div>
          <button
            className="bg-zinc-800 border border-zinc-700 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center hover:border-fuchsia-500 transition-all"
            onClick={() => navigate("/stats")}
          >
            <BarChart className="h-4 w-4 mr-2 text-fuchsia-400" />
            Estadísticas
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative z-10 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar número..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3.5 px-12 text-white focus:outline-none focus:border-fuchsia-500 placeholder-zinc-500"
              maxLength={4}
            />
            <Search className="absolute left-4 top-4 h-5 w-5 text-zinc-500" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-4"
              >
                <X className="h-5 w-5 text-zinc-500 hover:text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Panel de estadísticas */}
        <StatsPanel collected={collectedCount} total={10000} />
      </header>

      {/* Pestañas de filtro */}
      <FilterTabs
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
      />

      {/* Grid de números */}
      <NumberGrid
        numbers={filteredNumbers}
        onToggleNumber={toggleNumber}
        collectedNumbers={collectedNumbers}
      />

      {/* Botón flotante para añadir */}
      <div className="absolute right-5 bottom-24">
        <button
          onClick={handleScanClick}
          className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white p-4 rounded-full shadow-[0_0_15px_rgba(192,38,211,0.5)] hover:shadow-[0_0_25px_rgba(192,38,211,0.7)] transition-all"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>
      </div>

      {/* Barra de navegación inferior */}
      <div className="bg-zinc-900 border-t border-zinc-800 py-3 px-8 flex justify-around items-center">
        <button
          className={`flex flex-col items-center py-2 ${activeTab === "collection" ? "text-fuchsia-500" : "text-zinc-500"}`}
          onClick={() => setActiveTab("collection")}
        >
          <Star className="h-6 w-6" />
          <span className="text-xs mt-1 font-medium">Colección</span>
        </button>
        <button
          className={`flex flex-col items-center ${activeTab === "scanner" ? "text-fuchsia-500" : "text-zinc-500"}`}
          onClick={handleScanClick}
        >
          <div className="relative">
            <div className="h-12 w-12 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(192,38,211,0.5)]">
              <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </button>
        <button
          className={`flex flex-col items-center py-2 ${activeTab === "settings" ? "text-fuchsia-500" : "text-zinc-500"}`}
          onClick={handleSettingsClick}
        >
          <Settings className="h-6 w-6" />
          <span className="text-xs mt-1">Ajustes</span>
        </button>
      </div>

      {/* Modales */}
      {showScannerModal && (
        <ScannerModal
          onClose={handleCloseScannerModal}
          onScan={handleScannedNumber}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          onClose={handleCloseSettingsModal}
          collectedNumbers={collectedNumbers}
          setCollectedNumbers={setCollectedNumbers}
        />
      )}
    </div>
  );
};

export default HomeScreen;
