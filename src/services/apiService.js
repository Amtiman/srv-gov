import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllServices = async () => {
  try {
    const res = await axios.get(`${API_URL}/services`);
    return res.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const getServiceById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/services/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
};

export const createService = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/services`, data, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    });
    return res.data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

export const updateService = async (id, data) => {
  try {
    const res = await axios.put(`${API_URL}/services/${id}`, data, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    });
    return res.data;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

export const deleteService = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/services/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};