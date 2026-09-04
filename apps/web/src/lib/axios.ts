import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
  // Jika di Vercel, akan pakai URL Render. Jika lokal, otomatis ke 3001.
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true,
});

// 1. Menyelipkan token ke setiap request (Bawaan)
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. [BARU] Menangani Error 401 secara otomatis
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika backend merespons dengan 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Hapus token yang rusak/kadaluarsa dari browser
      Cookies.remove('token');
      
      // Paksa alihkan pengguna ke halaman login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);