import api from './api';

export const getDashboardStats = async () => {
    const response = await api.get('/Dashboard/stats');
    return response.data;
};