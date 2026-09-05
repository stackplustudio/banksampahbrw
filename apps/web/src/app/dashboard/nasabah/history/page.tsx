'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';

export default function NasabahHistory() {
  const [activeTab, setActiveTab] = useState<'SEMUA' | 'SETORAN' | 'PENARIKAN'>('SEMUA');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/nasabah/history').then(res => {
      setHistory(res.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const filteredHistory = history.filter(h => activeTab === 'SEMUA' || h.type === activeTab);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Tab Switcher - Desain Figma */}
      <div className="inline-flex bg-[#004d33] rounded-lg p-1 text-sm font-medium shadow-sm">
        <button 
          onClick={() => setActiveTab('SEMUA')} 
          className={`px-8 py-2 rounded-md transition-colors ${activeTab === 'SEMUA' ? 'bg-[#006644] text-white shadow-sm' : 'text-green-100 hover:text-white'}`}
        >
          Semua
        </button>
        <button 
          onClick={() => setActiveTab('SETORAN')} 
          className={`px-8 py-2 rounded-md transition-colors ${activeTab === 'SETORAN' ? 'bg-[#006644] text-white shadow-sm' : 'text-green-100 hover:text-white'}`}
        >
          Setoran
        </button>
        <button 
          onClick={() => setActiveTab('PENARIKAN')} 
          className={`px-8 py-2 rounded-md transition-colors ${activeTab === 'PENARIKAN' ? 'bg-[#006644] text-white shadow-sm' : 'text-green-100 hover:text-white'}`}
        >
          Penarikan
        </button>
      </div>

      {/* Tabel Riwayat */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.04)]">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/80 text-gray-900 border-b border-gray-100">
            {activeTab === 'SEMUA' ? (
              <tr>
                <th className="px-6 py-4 font-semibold text-[13px]">Jenis Transaksi</th>
                <th className="px-6 py-4 font-semibold text-[13px]">Deskripsi</th>
                <th className="px-6 py-4 font-semibold text-[13px]">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-[13px] text-right">Nominal</th>
              </tr>
            ) : activeTab === 'SETORAN' ? (
              <tr>
                <th className="px-6 py-4 font-semibold text-[13px]">Jenis Sampah</th>
                <th className="px-6 py-4 font-semibold text-[13px]">Berat</th>
                <th className="px-6 py-4 font-semibold text-[13px]">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-[13px]">Waktu</th>
                <th className="px-6 py-4 font-semibold text-[13px] text-right">Nominal</th>
              </tr>
            ) : (
              <tr>
                <th className="px-6 py-4 font-semibold text-[13px]">Jenis Transaksi</th>
                <th className="px-6 py-4 font-semibold text-[13px]">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-[13px]">Waktu</th>
                <th className="px-6 py-4 font-semibold text-[13px] text-right">Nominal</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">Memuat data...</td></tr>
            ) : filteredHistory.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">Belum ada transaksi.</td></tr>
            ) : (
              filteredHistory.map((item, idx) => {
                const date = new Date(item.date);
                const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                const nominalColor = item.type === 'SETORAN' ? 'text-green-600' : 'text-red-500';
                const sign = item.type === 'SETORAN' ? '+' : '-';
                
                if (activeTab === 'SEMUA') {
                  const desc = item.type === 'SETORAN' ? item.items.map((i:any) => `${i.name} - ${i.weight} kg`).join(', ') : 'Penarikan tunai';
                  return (
                    <tr key={item.id+idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">{item.type === 'SETORAN' ? 'Setoran' : 'Penarikan'}</td>
                      <td className="px-6 py-4">{desc}</td>
                      <td className="px-6 py-4 text-gray-500">{dateStr}</td>
                      <td className={`px-6 py-4 text-right font-medium ${nominalColor}`}>{sign} Rp {item.nominal.toLocaleString('id-ID')}</td>
                    </tr>
                  );
                }
                
                if (activeTab === 'SETORAN' && item.type === 'SETORAN') {
                  return item.items.map((i:any, j:number) => (
                    <tr key={`${item.id}-${j}`} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">{i.name}</td>
                      <td className="px-6 py-4">{i.weight} kg</td>
                      <td className="px-6 py-4 text-gray-500">{dateStr}</td>
                      <td className="px-6 py-4 text-gray-500">{timeStr}</td>
                      <td className="px-6 py-4 text-right font-medium text-green-600">+ Rp {(i.weight * 2000).toLocaleString('id-ID')}</td>
                    </tr>
                  ));
                }

                if (activeTab === 'PENARIKAN' && item.type === 'PENARIKAN') {
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">Penarikan tunai</td>
                      <td className="px-6 py-4 text-gray-500">{dateStr}</td>
                      <td className="px-6 py-4 text-gray-500">{timeStr}</td>
                      <td className="px-6 py-4 text-right font-medium text-red-500">- Rp {item.nominal.toLocaleString('id-ID')}</td>
                    </tr>
                  );
                }
                return null;
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}