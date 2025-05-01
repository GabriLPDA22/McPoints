import React, { useState } from "react";
import {
  X,
  Trash2,
  Save,
  Download,
  Upload,
  RotateCcw,
  Info,
  Sun,
  Moon,
} from "lucide-react";
import { saveData, removeData } from "../utils/storage";
import "../styles/Modal.css";

const SettingsModal = ({ onClose, collectedNumbers, setCollectedNumbers }) => {
  const [theme, setTheme] = useState("dark");
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Restablecer la colección
  const handleReset = () => {
    setCollectedNumbers({});
    saveData("collectedNumbers", {});
    setShowConfirmReset(false);
  };

  // Exportar datos
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(collectedNumbers);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = "mcpoints_collection.json";

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error("Error al exportar datos:", error);
      alert(
        "No se pudieron exportar los datos. Por favor, inténtalo de nuevo."
      );
    }
  };

  // Importar datos
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Validar que el formato es correcto
        if (typeof importedData === "object") {
          setCollectedNumbers(importedData);
          saveData("collectedNumbers", importedData);
          alert("Colección importada correctamente");
        } else {
          alert("Formato de archivo no válido");
        }
      } catch (error) {
        console.error("Error al importar datos:", error);
        alert(
          "No se pudieron importar los datos. El archivo podría estar dañado."
        );
      }
    };
    reader.readAsText(file);
  };

  // Cambiar tema (demo)
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
    // Aquí se implementaría el cambio real de tema
    alert(
      `El cambio de tema estará disponible próximamente. Tema seleccionado: ${
        theme === "dark" ? "claro" : "oscuro"
      }`
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container settings-modal">
        <div className="modal-header">
          <h2>Ajustes</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {showConfirmReset ? (
            <div className="confirm-dialog">
              <h3>¿Seguro que quieres borrar toda tu colección?</h3>
              <p>Esta acción no se puede deshacer.</p>
              <div className="button-group">
                <button
                  className="cancel-button"
                  onClick={() => setShowConfirmReset(false)}
                >
                  Cancelar
                </button>
                <button className="danger-button" onClick={handleReset}>
                  Eliminar colección
                </button>
              </div>
            </div>
          ) : showAbout ? (
            <div className="about-section">
              <h3>McPoints v1.0.0</h3>
              <p className="about-text">
                Una aplicación para coleccionar y llevar un seguimiento de tus
                números promocionales de McDonald's.
              </p>
              <p className="about-text">Desarrollado con React y Capacitor.</p>
              <button
                className="secondary-button"
                onClick={() => setShowAbout(false)}
              >
                Volver a Ajustes
              </button>
            </div>
          ) : (
            <div className="settings-list">
              <div className="settings-item">
                <div className="settings-info">
                  <div className="icon-container">
                    <Sun size={20} />
                    <Moon size={20} />
                  </div>
                  <div className="settings-text">
                    <h3>Tema de la aplicación</h3>
                    <p>Cambiar entre tema claro y oscuro</p>
                  </div>
                </div>
                <button className="settings-action" onClick={toggleTheme}>
                  {theme === "dark" ? "Claro" : "Oscuro"}
                </button>
              </div>

              <div className="settings-item">
                <div className="settings-info">
                  <div className="icon-container">
                    <Save size={20} />
                  </div>
                  <div className="settings-text">
                    <h3>Exportar colección</h3>
                    <p>Guarda un archivo con tu colección</p>
                  </div>
                </div>
                <button className="settings-action" onClick={handleExport}>
                  Exportar
                </button>
              </div>

              <div className="settings-item">
                <div className="settings-info">
                  <div className="icon-container">
                    <Upload size={20} />
                  </div>
                  <div className="settings-text">
                    <h3>Importar colección</h3>
                    <p>Carga un archivo con tu colección</p>
                  </div>
                </div>
                <div className="settings-action">
                  <input
                    type="file"
                    id="importFile"
                    accept=".json"
                    style={{ display: "none" }}
                    onChange={handleImport}
                  />
                  <label htmlFor="importFile" className="import-button">
                    Importar
                  </label>
                </div>
              </div>

              <div className="settings-item">
                <div className="settings-info">
                  <div className="icon-container danger">
                    <RotateCcw size={20} />
                  </div>
                  <div className="settings-text">
                    <h3>Reiniciar colección</h3>
                    <p>Elimina todos los números coleccionados</p>
                  </div>
                </div>
                <button
                  className="settings-action danger"
                  onClick={() => setShowConfirmReset(true)}
                >
                  Reiniciar
                </button>
              </div>

              <div className="settings-item">
                <div className="settings-info">
                  <div className="icon-container">
                    <Info size={20} />
                  </div>
                  <div className="settings-text">
                    <h3>Acerca de McPoints</h3>
                    <p>Información sobre la aplicación</p>
                  </div>
                </div>
                <button
                  className="settings-action"
                  onClick={() => setShowAbout(true)}
                >
                  Ver
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
