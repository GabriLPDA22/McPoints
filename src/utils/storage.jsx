import localforage from 'localforage';

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
