'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';
import { LayoutGrid, Scale, CreditCard, Users, Recycle, LogOut, Menu, X } from 'lucide-react'; // Bell dihapus, Menu & X ditambahkan

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // State untuk mengontrol Hamburger Menu di Mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Tutup sidebar otomatis saat berpindah halaman di Mobile
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/auth/login');
  };

  const navItems = [
    { name: 'Beranda', path: '/dashboard/admin', icon: LayoutGrid },
    { name: 'Setoran', path: '/dashboard/admin/setoran', icon: Scale },
    { name: 'Penarikan', path: '/dashboard/admin/penarikan', icon: CreditCard },
    { name: 'Nasabah', path: '/dashboard/admin/nasabah', icon: Users },
    { name: 'Sampah', path: '/dashboard/admin/sampah', icon: Recycle },
  ];

  const getPageTitle = () => {
    if (pathname === '/dashboard/admin') return { title: 'Admin Pengelola', subtitle: 'Selamat datang kembali,' };
    if (pathname === '/dashboard/admin/setoran') return { title: 'Setoran', subtitle: 'Daftar seluruh transaksi setoran sampah' };
    if (pathname === '/dashboard/admin/penarikan') return { title: 'Penarikan', subtitle: 'Daftar seluruh transaksi penarikan saldo' };
    if (pathname === '/dashboard/admin/nasabah') return { title: 'Data Nasabah', subtitle: 'Kelola data seluruh nasabah' };
    if (pathname === '/dashboard/admin/sampah') return { title: 'Katalog Sampah', subtitle: 'Kelola harga dan jenis sampah' };
    return { title: 'Dashboard Admin', subtitle: 'Panel kontrol utama' };
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden">
      
      {/* OVERLAY MOBILE: Muncul saat sidebar dibuka di HP */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 
        w-64 bg-[#004d33] text-white flex flex-col shadow-2xl md:shadow-lg shrink-0 
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-6 flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-3">
            {/* PERBAIKAN LOGO: bg-white dihapus agar logo putih transparan terlihat menyatu dengan background hijau */}
            <div className="w-10 h-10 relative shrink-0">
               <Image src="/logo.png" alt="Logo Bank Sampah" fill sizes="40px" className="object-contain" />
            </div>
            <div>
              <h2 className="font-bold tracking-wide text-sm leading-tight">BANK SAMPAH</h2>
              <p className="text-[10px] text-green-200 leading-tight">Sobat Banjar Arum<br/>Berseri</p>
            </div>
          </div>
          
          {/* Tombol Close Sidebar untuk Mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-green-200 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="px-6 py-4 text-[10px] uppercase tracking-wider font-semibold text-green-300 mt-2">
          Menu Utama
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
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
        
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm text-green-100 hover:bg-[#006644]/50 hover:text-white transition-colors">
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 md:h-24 bg-[#FCFDF9] border-b border-[#F2F4E6] px-4 md:px-8 flex items-center justify-between shrink-0 z-10">
          
          <div className="flex items-center gap-4">
            {/* Tombol Hamburger untuk Mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-[#004d33] p-1.5 hover:bg-green-50 rounded-md transition-colors"
            >
              <Menu size={24} />
            </button>

            {/* Judul Halaman */}
            <div>
              {pathname === '/dashboard/admin' ? (
                <>
                  <p className="hidden sm:block text-gray-500 text-sm mb-1">{subtitle}</p>
                  <h1 className="text-lg md:text-[22px] font-bold text-gray-900 leading-tight">{title}</h1>
                </>
              ) : (
                <>
                  <h1 className="text-lg md:text-[22px] font-bold text-gray-900 mb-1 leading-tight">{title}</h1>
                  <p className="hidden sm:block text-gray-500 text-sm">{subtitle}</p>
                </>
              )}
            </div>
          </div>

          {/* PERBAIKAN NOTIFIKASI: Ikon Bell dihapus, hanya menyisakan Profil */}
          <div className="flex items-center cursor-pointer group">
            <div className="text-right mr-3 hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#004d33] transition-colors">Admin Pengelola</p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 md:w-11 md:h-11 bg-[#F5F7F0] rounded-full flex items-center justify-center font-bold text-gray-700 text-sm md:text-base border border-[#E8EBE0] group-hover:border-[#004d33] transition-colors shadow-sm">
                AD
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
          </div>

        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-white p-4 md:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}