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
    <div className="p-6 max-w-7xl mx-auto space-y-6"> {/* Perbaikan Layout */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
        <p className="text-gray-500 text-sm">Daftar seluruh riwayat transaksi</p>
      </div>

      <div className="flex bg-[#004d33] w-fit rounded-lg p-1 text-sm font-medium">
        <button onClick={() => setActiveTab('SEMUA')} className={`px-6 py-2 rounded-md ${activeTab === 'SEMUA' ? 'bg-[#006644] text-white shadow' : 'text-green-100'}`}>Semua</button>
        <button onClick={() => setActiveTab('SETORAN')} className={`px-6 py-2 rounded-md ${activeTab === 'SETORAN' ? 'bg-[#006644] text-white shadow' : 'text-green-100'}`}>Setoran</button>
        <button onClick={() => setActiveTab('PENARIKAN')} className={`px-6 py-2 rounded-md ${activeTab === 'PENARIKAN' ? 'bg-[#006644] text-white shadow' : 'text-green-100'}`}>Penarikan</button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm mt-4">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 border-b">
            {activeTab === 'SEMUA' ? (
              <tr><th className="px-6 py-4 font-medium">Jenis Transaksi</th><th className="px-6 py-4 font-medium">Deskripsi</th><th className="px-6 py-4 font-medium">Tanggal</th><th className="px-6 py-4 font-medium text-right">Nominal</th></tr>
            ) : activeTab === 'SETORAN' ? (
              <tr><th className="px-6 py-4 font-medium">Jenis Sampah</th><th className="px-6 py-4 font-medium">Berat</th><th className="px-6 py-4 font-medium">Tanggal</th><th className="px-6 py-4 font-medium">Waktu</th><th className="px-6 py-4 font-medium text-right">Nominal</th></tr>
            ) : (
              <tr><th className="px-6 py-4 font-medium">Jenis Transaksi</th><th className="px-6 py-4 font-medium">Tanggal</th><th className="px-6 py-4 font-medium">Waktu</th><th className="px-6 py-4 font-medium text-right">Nominal</th></tr>
            )}
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center py-8">Memuat data...</td></tr> : filteredHistory.map((item, idx) => {
              const date = new Date(item.date);
              const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
              const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
              const nominalColor = item.type === 'SETORAN' ? 'text-green-600' : 'text-red-600';
              const sign = item.type === 'SETORAN' ? '+' : '-';
              
              if (activeTab === 'SEMUA') {
                const desc = item.type === 'SETORAN' ? item.items.map((i:any) => `${i.name} - ${i.weight} kg`).join(', ') : 'Penarikan tunai';
                return (
                  <tr key={item.id+idx} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{item.type === 'SETORAN' ? 'Setoran' : 'Penarikan'}</td>
                    <td className="px-6 py-4">{desc}</td>
                    <td className="px-6 py-4 text-gray-500">{dateStr}</td>
                    <td className={`px-6 py-4 text-right font-medium ${nominalColor}`}>{sign} Rp {item.nominal.toLocaleString('id-ID')}</td>
                  </tr>
                );
              }
              
              if (activeTab === 'SETORAN' && item.type === 'SETORAN') {
                return item.items.map((i:any, j:number) => (
                  <tr key={`${item.id}-${j}`} className="border-b hover:bg-gray-50">
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
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">Penarikan tunai</td>
                    <td className="px-6 py-4 text-gray-500">{dateStr}</td>
                    <td className="px-6 py-4 text-gray-500">{timeStr}</td>
                    <td className="px-6 py-4 text-right font-medium text-red-600">- Rp {item.nominal.toLocaleString('id-ID')}</td>
                  </tr>
                );
              }
              return null;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}