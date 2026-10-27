import api from './axios';

export const createChat = async (data) => {
  const res = await api.post('/chats', data);
  return res.data;
};

export const acceptChat = async (chatId) => {
  const res = await api.post(`/chats/${chatId}/accept`);
  return res.data;
};

export const declineChat = async (chatId) => {
  const res = await api.post(`/chats/${chatId}/decline`);
  return res.data;
};

export const endChat = async (chatId) => {
  const res = await api.post(`/chats/${chatId}/end`);
  return res.data;
};

export const rateChat = async (chatId, data) => {
  const res = await api.post(`/chats/${chatId}/rate`, data);
  return res.data;
};

export const getMyChats = async () => {
  const res = await api.get('/chats/mine');
  return res.data;
};

export const getMessages = async (chatId) => {
  const res = await api.get(`/chats/${chatId}/messages`);
  return res.data;
};

export const sendMessage = async (chatId, text) => {
  const res = await api.post(`/chats/${chatId}/messages`, { text });
  return res.data;
};
