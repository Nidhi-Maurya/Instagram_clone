export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export const getUserId = (user) => user?._id || user?.id;
