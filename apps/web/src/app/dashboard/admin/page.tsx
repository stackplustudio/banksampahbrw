'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#92400e', '#fcd34d', '#6b7280', '#d1d5db', '#84cc16', '#14b8a6'];

export default function AdminBerandaPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State Filter Tanggal (Default: 1 bulan terakhir)
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setDate(lastMonth.getDate() - 30);
  
  const [startDate, setStartDate] = useState(lastMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dashboard/summary?startDate=${startDate}&endDate=${endDate}`);
      setData(res.data);
    } catch (error) {
      console.error("Gagal memuat ringkasan", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [startDate, endDate]);

  if (!data && loading) return <div className="p-8 text-center text-gray-500">Memuat dasbor...</div>;
  
  const { summary, chartData } = data || {};

  // Custom Tooltip Pie Chart format: "plastik - 2,8kg"
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md text-sm font-medium">
          {data.name} - {data.weight}kg
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip Bar Chart format exact berat (kg)
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md text-sm font-medium">
          {label}: {payload[0].value} kg
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Selamat datang kembali,</p>
          <h1 className="text-3xl font-bold font-heading text-gray-900">Admin Pengelola</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Admin Pengelola</span>
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
            AD
          </div>
        </div>
      </div>

      <div className="bg-primary text-white rounded-xl p-6 shadow-sm flex flex-col justify-center">
        <p className="text-green-100 text-sm font-medium mb-1">Saldo Saat Ini</p>
        <h2 className="text-4xl font-bold">
          Rp. {summary?.saldoSistemSaatIni?.toLocaleString('id-ID') || 0}
        </h2>
      </div>

      <div className="flex justify-between items-center mt-8">
        <div>
          <h3 className="text-xl font-bold font-heading text-gray-900">Ringkasan Bank Sampah</h3>
          <p className="text-sm text-gray-500">Pantau data nasabah dan transaksi pada periode terpilih</p>
        </div>
        <div className="flex gap-2 items-center bg-white border border-gray-200 p-1.5 rounded-lg shadow-sm">
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="h-8 border-none shadow-none text-sm w-32"
          />
          <span className="text-gray-400">-</span>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="h-8 border-none shadow-none text-sm w-32"
          />
        </div>
      </div>

      {loading && data ? (
         <div className="text-center text-sm text-gray-500 py-4">Memperbarui data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Card Nasabah */}
            <div className="bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
              <div className="bg-[#004d33] text-white p-3 flex items-center gap-2 text-sm font-medium">
                <span className="text-lg">👥</span> Nasabah
              </div>
              <div className="p-4 flex-1">
                <div className="text-3xl font-bold font-heading text-gray-900">{summary?.totalNasabah || 0}</div>
                <p className="text-[11px] text-gray-400 mt-1 leading-tight">Total Nasabah yang Melakukan Setoran</p>
              </div>
            </div>

            {/* Card Setoran */}
            <div className="bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
              <div className="bg-blue-500 text-white p-3 flex items-center gap-2 text-sm font-medium">
                <span className="text-lg">⚖️</span> Setoran
              </div>
              <div className="p-4 flex-1">
                <div className="text-3xl font-bold font-heading text-gray-900">{summary?.totalBeratSetoran || 0}kg</div>
                <p className="text-[11px] text-gray-400 mt-1 leading-tight">Total Setoran Sampah</p>
              </div>
            </div>

            {/* Card Saldo Setoran */}
            <div className="bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
              <div className="bg-[#004d33] text-white p-3 flex items-center gap-2 text-sm font-medium">
                <span className="text-lg">💰</span> Saldo Setoran
              </div>
              <div className="p-4 flex-1">
                <div className="text-3xl font-bold font-heading text-gray-900">Rp. {summary?.totalSaldoSetoran?.toLocaleString('id-ID') || 0}</div>
                <p className="text-[11px] text-gray-400 mt-1 leading-tight">Total Saldo Setoran</p>
              </div>
            </div>

            {/* Card Saldo Penarikan */}
            <div className="bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
              <div className="bg-orange-500 text-white p-3 flex items-center gap-2 text-sm font-medium">
                <span className="text-lg">💳</span> Saldo Penarikan
              </div>
              <div className="p-4 flex-1">
                <div className="text-3xl font-bold font-heading text-gray-900">Rp. {summary?.totalSaldoPenarikan?.toLocaleString('id-ID') || 0}</div>
                <p className="text-[11px] text-gray-400 mt-1 leading-tight">Total Saldo yang Ditarik</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="shadow-sm border-gray-100 p-6">
              <div className="text-xs text-gray-500 mb-4">(Kg)</div>
              <div className="h-64 w-full">
                {chartData?.monthly?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.monthly} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="weight" fill="#006633" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">Tidak ada data setoran</div>
                )}
              </div>
            </Card>

            <Card className="shadow-sm border-gray-100 p-6">
              <h3 className="text-lg font-bold font-heading text-gray-900 mb-4">Komposisi Jenis Sampah</h3>
              <div className="flex items-center h-64">
                <div className="w-1/2 h-full relative">
                  {chartData?.composition?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData.composition} cx="50%" cy="50%" innerRadius={0} outerRadius={80} dataKey="weight" stroke="none">
                          {chartData.composition.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400 text-center">Data kosong</div>
                  )}
                </div>
                
                <div className="w-1/2 flex flex-col gap-3 pl-4 overflow-y-auto max-h-full">
                  {chartData?.composition?.map((item: any, index: number) => (
                    <div key={item.name} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-gray-600 truncate max-w-[80px]" title={item.name}>{item.name}</span>
                      </div>
                      <span className="font-medium text-gray-900 whitespace-nowrap">{item.weight} Kg</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}