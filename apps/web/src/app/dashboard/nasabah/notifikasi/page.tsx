'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { ArrowDown, Sprout } from 'lucide-react';

export default function NasabahNotifikasi() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Memanggil data riwayat transaksi untuk diubah menjadi format notifikasi
    api.get('/nasabah/history').then(res => {
      const rawData = res.data;
      const formattedNotifs: any[] = [];

      rawData.forEach((item: any) => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        if (item.type === 'PENARIKAN') {
          formattedNotifs.push({
            id: item.id,
            type: 'PENARIKAN',
            title: 'Penarikan',
            desc: `Penarikan tunai - ${dateStr}, ${timeStr}`,
            nominal: item.nominal,
            timestamp: date.getTime(),
          });
        } else if (item.type === 'SETORAN') {
          item.items.forEach((i: any, idx: number) => {
            formattedNotifs.push({
              id: `${item.id}-${idx}`,
              type: 'SETORAN',
              title: 'Setoran',
              desc: `${i.name} - ${i.weight} kg - ${dateStr}, ${timeStr}`,
              nominal: i.weight * 2000, // Menyesuaikan dengan logika di halaman history
              timestamp: date.getTime(),
            });
          });
        }
      });

      // Mengurutkan notifikasi dari yang paling baru
      formattedNotifs.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(formattedNotifs);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] p-8 mt-2">
        
        {/* Header Kotak Notifikasi */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-2">
          <h2 className="font-semibold text-gray-900 text-sm">Semua Notifikasi</h2>
          <span className="text-[11px] text-gray-400 font-medium">
            Menampilkan {notifications.length} pesan terbaru
          </span>
        </div>

        {/* Daftar Notifikasi */}
        <div className="divide-y divide-gray-100/80">
          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">Memuat notifikasi...</div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">Belum ada notifikasi.</div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="flex justify-between items-center py-5 hover:bg-gray-50/30 transition-colors px-2 -mx-2 rounded-lg">
                <div className="flex items-center gap-4">
                  
                  {/* Ikon Notifikasi */}
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                    {notif.type === 'PENARIKAN' ? (
                      <ArrowDown size={18} className="text-red-500" />
                    ) : (
                      <Sprout size={18} className="text-[#004d33]" />
                    )}
                  </div>
                  
                  {/* Teks Konten */}
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-gray-900 mb-0.5">{notif.title}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{notif.desc}</p>
                  </div>
                  
                </div>

                {/* Nominal di sebelah Kanan */}
                <div className={`text-sm font-bold tracking-wide ${notif.type === 'PENARIKAN' ? 'text-red-600' : 'text-[#004d33]'}`}>
                  {notif.type === 'PENARIKAN' ? '-' : '+'} Rp {notif.nominal.toLocaleString('id-ID')}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}