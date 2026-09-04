'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';

export default function NasabahLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{name: string, nasabahId: string} | null>(null);

  useEffect(() => {
    api.get('/nasabah/dashboard').then(res => setUser(res.data.user)).catch(() => {});
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/auth/login');
  };

  const navItems = [
    { name: 'Beranda', path: '/dashboard/nasabah', icon: '⊞' },
    { name: 'History', path: '/dashboard/nasabah/history', icon: '⏱' },
    { name: 'Profil', path: '/dashboard/nasabah/profil', icon: '👤' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#004d33] text-white flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <span className="text-2xl">🌱</span>
          <div>
            <h2 className="font-bold tracking-wide">BANK SAMPAH</h2>
            <p className="text-xs text-green-200">Sobat Banjar Arum Berseri</p>
          </div>
        </div>
        <div className="p-4 text-xs font-medium text-green-300">Menu Utama</div>
        <nav className="flex-1 px-3 space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <span className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                pathname === item.path ? 'bg-[#006644] font-medium' : 'text-green-100 hover:bg-[#006644]/50'
              }`}>
                <span className="text-lg">{item.icon}</span>{item.name}
              </span>
            </Link>
          ))}
        </nav>
        <div className="p-4">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm text-green-100 hover:bg-[#006644]/50 transition-colors">
            <span className="text-lg">↪</span> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white border-b px-8 flex items-center justify-end gap-6 shrink-0">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">{user?.name || 'Memuat...'}</p>
            <p className="text-xs text-gray-500">{user?.nasabahId || '-'}</p>
          </div>
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
            {user?.name?.substring(0,2).toUpperCase() || 'SA'}
          </div>
          <button className="relative w-10 h-10 border rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50">
            🔔<span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}