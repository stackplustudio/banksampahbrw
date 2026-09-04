'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/axios';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

// --- Komponen Custom Searchable Dropdown ---
function SearchableSelect({ options, value, onChange, placeholder }: { options: {value: string, label: string}[], value: string, onChange: (v: string) => void, placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const selected = options.find(o => o.value === value);
  const displayValue = isOpen ? search : (selected ? selected.label : '');
  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative w-full">
      <Input 
        value={displayValue}
        onChange={e => { setSearch(e.target.value); setIsOpen(true); onChange(''); }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        className="w-full bg-white"
        required={!value}
      />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(o => (
            <div 
              key={o.value} 
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
              onMouseDown={() => { onChange(o.value); setSearch(''); setIsOpen(false); }}
            >
              {o.label}
            </div>
          ))}
          {filtered.length === 0 && <div className="p-2 text-sm text-gray-500 text-center">Tidak ditemukan</div>}
        </div>
      )}
    </div>
  );
}

export default function AdminPenarikanPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [nasabahList, setNasabahList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [searchNasabah, setSearchNasabah] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNasabahId, setSelectedNasabahId] = useState('');
  const [amountInput, setAmountInput] = useState('');

  const fetchData = async () => {
    try {
      const [wdRes, userRes] = await Promise.all([
        api.get('/withdrawals'),
        api.get('/users')
      ]);
      setWithdrawals(wdRes.data);
      setNasabahList(userRes.data.filter((u: any) => u.role === 'NASABAH' && u.status === 'AKTIF'));
    } catch (error) {
      console.error('Gagal memuat data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filter Logic
  const filteredWithdrawals = withdrawals.filter(w => {
    const wDate = w.createdAt.split('T')[0];
    const matchDate = wDate >= startDate && wDate <= endDate;
    const matchName = w.nasabah.name.toLowerCase().includes(searchNasabah.toLowerCase());
    return matchDate && matchName;
  });

  // Computed state untuk validasi real-time
  const selectedNasabah = useMemo(() => nasabahList.find(n => n.id === selectedNasabahId), [selectedNasabahId, nasabahList]);
  const currentBalance = selectedNasabah?.balance || 0;
  const withdrawAmount = parseFloat(amountInput) || 0;
  const isInsufficient = withdrawAmount > currentBalance;
  const isSubmitDisabled = !selectedNasabahId || withdrawAmount <= 0 || isInsufficient;

  const nasabahOptions = nasabahList.map(n => ({ value: n.id, label: `${n.name} (${n.nasabahId})` }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    try {
      await api.post('/withdrawals', { nasabahId: selectedNasabahId, amount: withdrawAmount });
      setIsModalOpen(false);
      setSelectedNasabahId('');
      setAmountInput('');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal memproses penarikan');
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredWithdrawals.map((w) => {
      const date = new Date(w.createdAt);
      return {
        'Tanggal': date.toLocaleDateString('id-ID'),
        'Waktu': date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        'ID Nasabah': w.nasabah.nasabahId,
        'Nama': w.nasabah.name,
        'Saldo Ditarik (Rp)': w.amount,
        'Sisa Saldo (Rp)': w.remainingBalance
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Penarikan");
    worksheet['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 20 }];
    XLSX.writeFile(workbook, `Data_Penarikan_${startDate}_sd_${endDate}.xlsx`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Penarikan</h1>
          <p className="text-gray-500 text-sm">Daftar seluruh transaksi penarikan saldo nasabah.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportExcel}>Eksport</Button>
          <Button onClick={() => setIsModalOpen(true)}>+ Catat Penarikan</Button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex gap-4 items-center">
        <div className="flex gap-2 items-center bg-white border border-gray-200 p-1.5 rounded-lg shadow-sm">
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-8 border-none shadow-none text-sm w-36" />
          <span className="text-gray-400">-</span>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-8 border-none shadow-none text-sm w-36" />
        </div>
        <Input 
          placeholder="Cari nama nasabah..." 
          value={searchNasabah}
          onChange={e => setSearchNasabah(e.target.value)}
          className="w-64 bg-white shadow-sm"
        />
      </div>

      <Card className="overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 border-b">
            <tr>
              <th className="px-6 py-4 font-medium">Tanggal</th>
              <th className="px-6 py-4 font-medium">Waktu</th>
              <th className="px-6 py-4 font-medium">ID</th>
              <th className="px-6 py-4 font-medium">Nama</th>
              <th className="px-6 py-4 font-medium">Saldo Ditarik</th>
              <th className="px-6 py-4 font-medium">Sisa Saldo</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Memuat data...</td></tr>
            ) : filteredWithdrawals.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada catatan penarikan.</td></tr>
            ) : (
              filteredWithdrawals.map((item) => {
                const date = new Date(item.createdAt);
                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{date.toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4">{date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-4 font-medium">{item.nasabah.nasabahId}</td>
                    <td className="px-6 py-4">{item.nasabah.name}</td>
                    <td className="px-6 py-4 font-medium text-red-600">Rp {item.amount.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">Rp {item.remainingBalance.toLocaleString('id-ID')}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

      {/* Modal Catat Penarikan */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm bg-card overflow-visible shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle>Catat Penarikan</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Nama</label>
                  <SearchableSelect 
                    options={nasabahOptions} 
                    value={selectedNasabahId} 
                    onChange={setSelectedNasabahId} 
                    placeholder="Pilih nama untuk catat penarikan" 
                  />
                </div>

                {selectedNasabah && (
                  <div className="space-y-1 mt-4">
                    <label className="text-sm font-medium text-gray-500">Sisa Saldo</label>
                    <div className="text-3xl font-bold text-gray-900">
                      {currentBalance.toLocaleString('id-ID')}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-sm font-medium">Tarik Saldo</label>
                  <Input 
                    type="number" 
                    placeholder="Masukkan jumlah saldo yang ingin ditarik" 
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    required 
                    className={isInsufficient ? "border-red-500 focus-visible:ring-red-500/50" : ""}
                  />
                  {isInsufficient && <p className="text-xs text-red-500 mt-1">Jumlah saldo tidak mencukupi</p>}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t pt-4">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isSubmitDisabled} className="bg-[#004d33] text-white disabled:bg-gray-300">Simpan</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}