import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', // Pastikan port sesuai dengan backend-mu
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika backend menolak akses (Token kedaluwarsa atau Akun Dimatikan)
    if (error.response?.status === 401) {
      Cookies.remove('token');
      
      if (typeof window !== 'undefined') {
        // 1. Jika sedang mencoba login, JANGAN di-refresh agar pesan merah tetap tayang terus!
        if (window.location.pathname !== '/auth/login') {
          
          // 2. Jika sedang di dalam dashboard, beri waktu 3 detik agar toast error bisa dibaca
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 3000); 
          
        }
      }
    }
    return Promise.reject(error);
  }
);