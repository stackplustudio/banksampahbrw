'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';

export default function NasabahBeranda() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/nasabah/dashboard').then(res => setData(res.data)).catch(console.error);
  }, []);

  if (!data) return <div className="p-8 text-center text-gray-500">Memuat...</div>;
  const { user, summary, prices } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6"> {/* Perubahan di sini: p-6 max-w-7xl mx-auto */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Selamat Datang Kembali, {user.name}</h1>
        <p className="text-gray-500 text-sm">Selamat Datang Kembali</p>
      </div>

      <div className="bg-[#004d33] text-white rounded-xl p-6 shadow-sm">
        <p className="text-green-100 text-sm mb-1">Saldo Tabungan</p>
        <h2 className="text-4xl font-bold">Rp {user.balance.toLocaleString('id-ID')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-gray-100 overflow-hidden flex flex-col">
          <div className="bg-blue-500 text-white p-3 text-sm font-medium flex gap-2 items-center">📈 Total Setoran Sampah</div>
          <CardContent className="p-4 flex-1">
            <h3 className="text-2xl font-bold text-gray-900">{summary.totalSetoranKg} Kg</h3>
            <p className="text-xs text-gray-400 mt-1">Sampah yang telah disetorkan</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100 overflow-hidden flex flex-col">
          <div className="bg-[#004d33] text-white p-3 text-sm font-medium flex gap-2 items-center">💰 Total Saldo Setoran</div>
          <CardContent className="p-4 flex-1">
            <h3 className="text-2xl font-bold text-gray-900">Rp {summary.totalSetoranRp.toLocaleString('id-ID')}</h3>
            <p className="text-xs text-gray-400 mt-1">Akumulasi hasil setoran</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100 overflow-hidden flex flex-col">
          <div className="bg-orange-500 text-white p-3 text-sm font-medium flex gap-2 items-center">💳 Total Penarikan</div>
          <CardContent className="p-4 flex-1">
            <h3 className="text-2xl font-bold text-gray-900">Rp {summary.totalPenarikanRp.toLocaleString('id-ID')}</h3>
            <p className="text-xs text-gray-400 mt-1">Saldo yang telah dicairkan</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-900">Harga Sampah Hari Ini</h3>
        <p className="text-sm text-gray-500 mb-4">Daftar estimasi harga penukaran sampah per kilogram terbaru</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {prices.map((p: any) => (
            <Card key={p.id} className="shadow-sm border-gray-100">
              <CardContent className="p-5">
                <div className="w-8 h-8 mb-3 bg-gray-50 flex items-center justify-center rounded text-gray-500 border">📦</div>
                <p className="text-sm text-gray-600 font-medium">{p.name}</p>
                <h4 className="text-lg font-bold text-gray-900 mt-1">Rp {p.pricePerKg.toLocaleString('id-ID')}/kg</h4>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}