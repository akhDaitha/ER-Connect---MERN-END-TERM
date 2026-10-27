import api from './axios';

export const createReport = async (data) => {
  const res = await api.post('/reports', data);
  return res.data;
};
