'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/auth/login');
  };

  const navItems = [
    { name: 'Beranda', path: '/dashboard/admin', icon: '⊞' },
    { name: 'Setoran', path: '/dashboard/admin/setoran', icon: '⚖' },
    { name: 'Penarikan', path: '/dashboard/admin/penarikan', icon: '💳' },
    { name: 'Nasabah', path: '/dashboard/admin/nasabah', icon: '👥' },
    { name: 'Sampah', path: '/dashboard/admin/sampah', icon: '♻' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <span className="text-2xl">🌱</span>
          <div>
            <h2 className="font-heading font-semibold leading-tight">BANK SAMPAH</h2>
            <p className="text-xs text-green-200">Sobat Banjar Arum</p>
          </div>
        </div>
        
        <div className="p-4 text-xs font-medium text-green-300 uppercase tracking-wider">
          Menu Utama
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <span className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-800/50'
                }`}>
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-green-100 hover:bg-green-800/50 transition-colors">
            <span className="text-lg">↪</span>
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}