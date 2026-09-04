'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.access_token) {
        Cookies.set('token', response.data.access_token, { expires: 7 });
        
        // Ambil data role dari respons backend (sesuaikan strukturnya jika berbeda, misal response.data.role)
        const role = response.data.user?.role || response.data.role;

        // Redirect dinamis berdasarkan role
        if (role === 'ADMIN' || role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/nasabah');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email atau kata sandi tidak valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      {/* Ornamen Header Kiri Atas */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-primary font-bold text-xl">🌱</span>
        </div>
        <div>
          <h2 className="font-heading font-semibold text-gray-900 leading-tight">BANK SAMPAH</h2>
          <p className="text-xs text-gray-500">Sobat Banjar Arum<br/>Berseri</p>
        </div>
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-primary font-bold text-2xl">🌱</span>
          </div>
          <h1 className="text-2xl font-semibold font-heading text-gray-900 mb-1">
            Selamat Datang Kembali
          </h1>
          <p className="text-sm text-gray-500">
            Masuk ke akun Bank Sampah Anda
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">Email</label>
            <Input 
              type="email" 
              placeholder="sitiaminah@gmail.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">Kata Sandi</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="h-11"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary accent-primary" />
              <span className="text-gray-700">Ingat saya</span>
            </label>
            <a href="#" className="text-primary hover:underline font-medium">
              Lupa Kata Sandi?
            </a>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 text-base font-medium rounded-lg"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Login'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Belum memiliki akun? <a href="#" className="text-gray-900 font-semibold hover:underline">Hubungi Admin Desa</a>
        </div>
      </div>
    </div>
  );
}