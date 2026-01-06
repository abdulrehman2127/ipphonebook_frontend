import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const endpoints = {
  readPhonebook: `${API_BASE_URL}/phonebook/read/`,
  writePhonebook: `${API_BASE_URL}/phonebook/write/`,
  addEntry: `${API_BASE_URL}/phonebook/add-entry/`,
  importCSV: `${API_BASE_URL}/phonebook/import-csv/`,
};

export const readPhonebook = async () => {
  try {
    const response = await axios.get(endpoints.readPhonebook);
    return response.data;
  } catch (error) {
    console.error('Error reading phonebook:', error);
    throw error;
  }
};

export const writePhonebook = async (data) => {
  try {
    const response = await axios.post(endpoints.writePhonebook, data);
    return response.data;
  } catch (error) {
    console.error('Error writing phonebook:', error);
    throw error;
  }
};

export const addPhonebookEntry = async (entryData) => {
  try {
    const response = await axios.post(endpoints.addEntry, entryData);
    return response.data;
  } catch (error) {
    console.error('Error adding phonebook entry:', error);
    throw error;
  }
};

export const importCSVToPhonebook = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(endpoints.importCSV, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error importing CSV:', error);
    throw error;
  }
};

export default {
  readPhonebook,
  writePhonebook,
  addPhonebookEntry,
  importCSVToPhonebook,
};
