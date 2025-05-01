import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NumberGrid from "../components/NumberGrid.jsx";
import SearchBar from "../components/SearchBar.jsx";
import StatsPanel from "../components/StatsPanel.jsx";
import FilterTabs from "../components/FilterTabs.jsx";
import ScannerModal from "../components/ScannerModal.jsx";
import SettingsModal from "../components/SettingsModal.jsx";
import { saveData } from "../utils/storage";
import "../styles/HomeScreen.css";

// Importamos iconos de Lucide React
import { Award, Camera, Settings, Star } from "lucide-react";

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

  // Generar números filtrados
  const getFilteredNumbers = () => {
    const numbers = [];
    for (let i = 0; i <= 999; i++) {
      const numStr = i.toString().padStart(3, "0");

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
    if (number && number.length === 3 && !isNaN(number)) {
      const newNumbers = { ...collectedNumbers };
      newNumbers[number] = true;
      setCollectedNumbers(newNumbers);
      saveData("collectedNumbers", newNumbers);
      setShowScannerModal(false);
      setActiveTab("collection");
    }
  };

  const filteredNumbers = getFilteredNumbers();
  const collectedCount = getCollectedCount();

  return (
    <div className="home-screen">
      <header>
        <div className="logo-container">
          <Star className="logo-icon" />
          <h1 className="app-title">McPoints</h1>
        </div>
        <button className="stats-button" onClick={() => navigate("/stats")}>
          <Award className="button-icon" />
          Estadísticas
        </button>
      </header>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <StatsPanel collected={collectedCount} total={1000} />

      <FilterTabs
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
      />

      <NumberGrid
        numbers={filteredNumbers}
        onToggleNumber={toggleNumber}
        collectedNumbers={collectedNumbers}
      />

      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === "collection" ? "active" : ""}`}
          onClick={() => setActiveTab("collection")}
        >
          <Award className="nav-icon" />
          <span>Colección</span>
        </button>
        <button
          className={`nav-item ${activeTab === "scanner" ? "active" : ""}`}
          onClick={handleScanClick}
        >
          <Camera className="nav-icon" />
          <span>Escanear</span>
        </button>
        <button
          className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
          onClick={handleSettingsClick}
        >
          <Settings className="nav-icon" />
          <span>Ajustes</span>
        </button>
      </nav>

      {/* Modal de escáner */}
      {showScannerModal && (
        <ScannerModal
          onClose={handleCloseScannerModal}
          onScan={handleScannedNumber}
        />
      )}

      {/* Modal de ajustes */}
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
