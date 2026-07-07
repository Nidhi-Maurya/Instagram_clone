export const API_BASE_URL = 'http://localhost:8000';

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export const getUserId = (user) => user?._id || user?.id;
