import localforage from 'localforage';

// Configuración de localforage para McPoints
localforage.config({
  name: 'McPoints',
  storeName: 'mcpoints_data',
  description: 'Almacenamiento local para McPoints app'
});

export const saveData = async (key, value) => {
  try {
    await localforage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('Error saving data', error);
    return false;
  }
};

export const loadData = async (key) => {
  try {
    const value = await localforage.getItem(key);
    return value;
  } catch (error) {
    console.error('Error loading data', error);
    return null;
  }
};

export const removeData = async (key) => {
  try {
    await localforage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing data', error);
    return false;
  }
};

// Función auxiliar para exportar datos a un archivo
export const exportCollection = (collectionData, filename = 'mcpoints_collection.json') => {
  try {
    const dataStr = JSON.stringify(collectionData);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", filename);
    linkElement.click();

    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    return false;
  }
};

// Función para limpiar todos los datos guardados
export const clearAllData = async () => {
  try {
    await localforage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing data', error);
    return false;
  }
};
