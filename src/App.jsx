import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import StatsScreen from "./screens/StatsScreen";
import { loadData } from "./utils/storage";
import "./styles/global.css";

function App() {
  const [collectedNumbers, setCollectedNumbers] = useState({});

  useEffect(() => {
    // Cargar datos guardados al iniciar la app
    const loadSavedData = async () => {
      const saved = await loadData("collectedNumbers");
      if (saved) {
        setCollectedNumbers(saved);
      }
    };

    loadSavedData();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route
            path="/"
            element={
              <HomeScreen
                collectedNumbers={collectedNumbers}
                setCollectedNumbers={setCollectedNumbers}
              />
            }
          />
          <Route
            path="/stats"
            element={<StatsScreen collectedNumbers={collectedNumbers} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
