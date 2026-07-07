const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isLocalHost ? 'http://localhost:8000' : '');

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export const getUserId = (user) => user?._id || user?.id;
