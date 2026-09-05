'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { TrendingUp, Wallet, ArrowDownRight, Package, ShoppingBag, FileText, Database, GlassWater, Leaf, Recycle } from 'lucide-react';

export default function NasabahBeranda() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/nasabah/dashboard').then(res => setData(res.data)).catch(console.error);
  }, []);

  if (!data) return <div className="p-8 text-center text-gray-500">Memuat...</div>;
  const { user, summary, prices } = data;

  // PERBAIKAN: Fungsi penentu Ikon berdasarkan nama kategori sampah
  const getIconForWaste = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('plastik')) return <ShoppingBag size={18} strokeWidth={1.5} />;
    if (lowerName.includes('kardus')) return <Package size={18} strokeWidth={1.5} />;
    if (lowerName.includes('kertas')) return <FileText size={18} strokeWidth={1.5} />;
    if (lowerName.includes('aluminium') || lowerName.includes('besi') || lowerName.includes('logam')) return <Database size={18} strokeWidth={1.5} />;
    if (lowerName.includes('kaca') || lowerName.includes('botol')) return <GlassWater size={18} strokeWidth={1.5} />;
    if (lowerName.includes('organik')) return <Leaf size={18} strokeWidth={1.5} />;
    return <Recycle size={18} strokeWidth={1.5} />; // Default Icon
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-[#004d33] text-white rounded-xl p-8 shadow-md">
        <p className="text-green-100 text-sm mb-2 font-medium">Saldo Tabungan</p>
        <h2 className="text-4xl font-bold tracking-tight">Rp {user.balance.toLocaleString('id-ID')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col bg-white">
          <div className="bg-blue-500 text-white p-3.5 text-sm font-medium flex gap-2 items-center">
            <TrendingUp size={16} /> Total Setoran Sampah
          </div>
          <div className="p-5 flex-1">
            <h3 className="text-2xl font-bold text-gray-900">{summary.totalSetoranKg} Kg</h3>
            <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-medium">Sampah yang telah disetorkan</p>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col bg-white">
          <div className="bg-[#004d33] text-white p-3.5 text-sm font-medium flex gap-2 items-center">
            <Wallet size={16} /> Total Saldo Setoran
          </div>
          <div className="p-5 flex-1">
            <h3 className="text-2xl font-bold text-gray-900">Rp {summary.totalSetoranRp.toLocaleString('id-ID')}</h3>
            <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-medium">Akumulasi hasil setoran</p>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col bg-white">
          <div className="bg-orange-500 text-white p-3.5 text-sm font-medium flex gap-2 items-center">
            <ArrowDownRight size={16} /> Total Penarikan
          </div>
          <div className="p-5 flex-1">
            <h3 className="text-2xl font-bold text-gray-900">Rp {summary.totalPenarikanRp.toLocaleString('id-ID')}</h3>
            <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-medium">Saldo yang telah dicairkan</p>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Harga Sampah Hari Ini</h3>
        <p className="text-sm text-gray-500 mb-6">Daftar estimasi harga penukaran sampah per kilogram terbaru</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {prices.map((p: any) => (
            <div key={p.id} className="bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 p-5 flex flex-col text-left">
              {/* PERBAIKAN IKON DINAMIS */}
              <div className="w-9 h-9 mb-4 bg-gray-50 flex items-center justify-center rounded-lg text-gray-600 border border-gray-100">
                {getIconForWaste(p.name)}
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">{p.name}</p>
              <h4 className="text-lg font-bold text-gray-900">Rp {p.pricePerKg.toLocaleString('id-ID')}/kg</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}