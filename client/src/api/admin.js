import api from './axios';

export const getAdminStats = async () => {
  const res = await api.get('/admin/stats');
  return res.data;
};

export const getAdminReports = async (status) => {
  const params = status ? { status } : {};
  const res = await api.get('/admin/reports', { params });
  return res.data;
};

export const resolveReport = async (reportId, data) => {
  const res = await api.patch(`/admin/reports/${reportId}`, data);
  return res.data;
};

export const getChatTranscript = async (chatId) => {
  const res = await api.get(`/admin/chats/${chatId}/transcript`);
  return res.data;
};

export const createER = async (data) => {
  const res = await api.post('/admin/ers', data);
  return res.data;
};

export const updateERStatus = async (erId, data) => {
  const res = await api.patch(`/admin/ers/${erId}`, data);
  return res.data;
};

export const getAllERs = async () => {
  const res = await api.get('/admin/ers');
  return res.data;
};

export const getCrisisFlags = async () => {
  const res = await api.get('/admin/crisis-flags');
  return res.data;
};

export const getAuditLogs = async (page = 1) => {
  const res = await api.get('/admin/audit-log', { params: { page } });
  return res.data;
};
