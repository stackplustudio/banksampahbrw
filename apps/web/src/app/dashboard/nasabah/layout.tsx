'use client';

import Link from 'next/link';
import Image from 'next/image'; // Import Image Next.js
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { LayoutGrid, History, User, LogOut, Bell } from 'lucide-react';

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
    { name: 'Beranda', path: '/dashboard/nasabah', icon: LayoutGrid },
    { name: 'History', path: '/dashboard/nasabah/history', icon: History },
    { name: 'Profil', path: '/dashboard/nasabah/profil', icon: User },
  ];

  const getPageTitle = () => {
    if (pathname === '/dashboard/nasabah') return { title: `Selamat Datang Kembali, ${user?.name || ''}`, subtitle: 'Selamat Datang Kembali' };
    if (pathname === '/dashboard/nasabah/history') return { title: 'Riwayat Transaksi', subtitle: 'Daftar seluruh riwayat transaksi' };
    if (pathname === '/dashboard/nasabah/profil') return { title: 'Profil Saya', subtitle: 'Kelola informasi pribadi Anda' };
    if (pathname === '/dashboard/nasabah/notifikasi') return { title: 'Notifikasi', subtitle: 'Dapatkan informasi terbaru' };
    return { title: 'Dashboard', subtitle: 'Panel kontrol Bank Sampah' };
  };

  // LOGIKA INISIAL NAMA: Mengambil huruf pertama dari kata pertama dan kedua (Siti Aminah -> SA)
  const getInitials = (name?: string) => {
    if (!name) return 'SA';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#004d33] text-white flex flex-col shadow-lg z-10 shrink-0">
        <div className="p-6 flex items-center gap-3">
          {/* PERBAIKAN LOGO: Memanggil /logo.png dari folder public */}
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 overflow-hidden relative">
             <Image src="/logo.png" alt="Logo Bank Sampah" fill className="object-cover p-1" />
          </div>
          <div>
            <h2 className="font-bold tracking-wide text-sm leading-tight">BANK SAMPAH</h2>
            <p className="text-[10px] text-green-200 leading-tight">Sobat Banjar Arum<br/>Berseri</p>
          </div>
        </div>
        
        <div className="px-6 py-4 text-[10px] uppercase tracking-wider font-semibold text-green-300 mt-2">
          Menu Utama
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <span className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-[#006644] font-medium text-white shadow-sm' : 'text-green-100 hover:bg-[#006644]/50 hover:text-white'
                }`}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm text-green-100 hover:bg-[#006644]/50 hover:text-white transition-colors">
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar / Header */}
        <header className="h-24 bg-[#FCFDF9] border-b border-[#F2F4E6] px-8 flex items-center justify-between shrink-0 z-0">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 mb-1">{title}</h1>
            <p className="text-gray-500 text-sm">{subtitle}</p>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dashboard/nasabah/profil" className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-[#004d33] transition-colors">{user?.name || 'Memuat...'}</p>
                <p className="text-[11px] text-gray-500 font-medium">{user?.nasabahId || '-'}</p>
              </div>
              <div className="relative">
                {/* PERBAIKAN INISIAL DI HEADER */}
                <div className="w-11 h-11 bg-[#F5F7F0] rounded-full flex items-center justify-center font-bold text-gray-700 text-sm border border-[#E8EBE0] group-hover:border-[#004d33] transition-colors">
                  {getInitials(user?.name)}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
            </Link>
            
            <Link 
              href="/dashboard/nasabah/notifikasi"
              className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-colors border ${
                pathname === '/dashboard/nasabah/notifikasi' 
                  ? 'bg-[#004d33] text-white border-[#004d33]' 
                  : 'bg-[#F5F7F0] text-[#004d33] border-[#E8EBE0] hover:bg-[#E8EBE0]'
              }`}
            >
              <Bell size={20} strokeWidth={pathname === '/dashboard/nasabah/notifikasi' ? 2.5 : 2} />
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-white p-8">
          {children}
        </main>
      </div>
    </div>
  );
}