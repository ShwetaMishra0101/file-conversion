import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:7001/api' });

export const getMedia = (params) => API.get('/media', { params });
export const uploadMedia  = (formData) => API.post('/media/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const convertMedia = (id, format) => API.post(`/media/convert/${id}`, { format });
export const downloadMedia = (id) => API.get(`/media/download/${id}`, { responseType: 'blob' });
export const deleteMedia  = (id) => API.delete(`/media/${id}`);