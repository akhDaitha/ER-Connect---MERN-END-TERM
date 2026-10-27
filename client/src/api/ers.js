import api from './axios';

export const getAvailableERs = async (params = {}) => {
  const res = await api.get('/ers/available', { params });
  return res.data;
};

export const updateAvailability = async (isAvailable) => {
  const res = await api.patch('/ers/availability', { isAvailable });
  return res.data;
};
