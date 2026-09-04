'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

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

export default function AdminSetoranPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [nasabahList, setNasabahList] = useState<any[]>([]);
  const [wasteTypes, setWasteTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [searchNasabah, setSearchNasabah] = useState('');

  // Modals States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null);

  // Form States
  const [selectedNasabahId, setSelectedNasabahId] = useState('');
  const [depositItems, setDepositItems] = useState([{ wasteTypeId: '', weight: '' }]);

  const fetchData = async () => {
    try {
      const [depRes, userRes, wasteRes] = await Promise.all([
        api.get('/deposits'),
        api.get('/users'),
        api.get('/waste-types')
      ]);
      setDeposits(depRes.data);
      setNasabahList(userRes.data.filter((u: any) => u.role === 'NASABAH' && u.status === 'AKTIF'));
      setWasteTypes(wasteRes.data);
    } catch (error) {
      console.error('Gagal memuat data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filter Logic
  const filteredDeposits = deposits.filter(d => {
    const dDate = d.createdAt.split('T')[0];
    const matchDate = dDate >= startDate && dDate <= endDate;
    const matchName = d.nasabah.name.toLowerCase().includes(searchNasabah.toLowerCase());
    return matchDate && matchName;
  });

  // Options untuk Searchable Select
  const nasabahOptions = nasabahList.map(n => ({ value: n.id, label: `${n.name} (${n.nasabahId})` }));
  const wasteOptions = wasteTypes.map(w => ({ value: w.id, label: `${w.name} - Rp${w.pricePerKg}/kg` }));

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...depositItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setDepositItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedItems = depositItems.map(item => {
      const waste = wasteTypes.find(w => w.id === item.wasteTypeId);
      const weight = parseFloat(item.weight) || 0;
      return { wasteTypeId: item.wasteTypeId, weight: weight, subtotal: waste ? weight * waste.pricePerKg : 0 };
    }).filter(item => item.wasteTypeId && item.weight > 0);

    if (formattedItems.length === 0) return alert('Masukkan minimal 1 jenis sampah yang valid.');

    try {
      await api.post('/deposits', { nasabahId: selectedNasabahId, items: formattedItems });
      setIsAddModalOpen(false);
      setSelectedNasabahId('');
      setDepositItems([{ wasteTypeId: '', weight: '' }]);
      fetchData();
    } catch (error) {
      alert('Gagal mencatat setoran');
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredDeposits.map((d) => {
      const date = new Date(d.createdAt);
      return {
        'Tanggal': date.toLocaleDateString('id-ID'),
        'Waktu': date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        'ID Nasabah': d.nasabah.nasabahId,
        'Nama': d.nasabah.name,
        'Total Berat (Kg)': d.totalWeight,
        'Total Harga (Rp)': d.totalAmount
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Setoran");
    worksheet['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }];
    XLSX.writeFile(workbook, `Data_Setoran_${startDate}_sd_${endDate}.xlsx`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Setoran</h1>
          <p className="text-gray-500 text-sm">Daftar seluruh transaksi setoran nasabah.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportExcel}>Eksport</Button>
          <Button onClick={() => setIsAddModalOpen(true)}>+ Catat Setoran</Button>
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
              <th className="px-6 py-4 font-medium">Total Berat</th>
              <th className="px-6 py-4 font-medium">Total Harga</th>
              <th className="px-6 py-4 font-medium text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8">Memuat data...</td></tr>
            ) : filteredDeposits.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Tidak ada data setoran.</td></tr>
            ) : (
              filteredDeposits.map((item) => {
                const date = new Date(item.createdAt);
                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{date.toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4">{date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-4 font-medium">{item.nasabah.nasabahId}</td>
                    <td className="px-6 py-4">{item.nasabah.name}</td>
                    <td className="px-6 py-4">{item.totalWeight} Kg</td>
                    <td className="px-6 py-4 font-medium text-green-600">Rp {item.totalAmount.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => { setSelectedDeposit(item); setIsDetailModalOpen(true); }} className="text-gray-400 hover:text-green-900 text-xl">👁️</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

      {/* Modal Tambah Setoran */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-card max-h-[90vh] overflow-visible shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle>Tambah Setoran</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Nama Nasabah</label>
                  <SearchableSelect 
                    options={nasabahOptions} 
                    value={selectedNasabahId} 
                    onChange={setSelectedNasabahId} 
                    placeholder="Ketik untuk mencari nasabah..." 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jenis & Berat Sampah</label>
                  {depositItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <SearchableSelect 
                          options={wasteOptions} 
                          value={item.wasteTypeId} 
                          onChange={(val) => handleItemChange(idx, 'wasteTypeId', val)} 
                          placeholder="Pilih sampah" 
                        />
                      </div>
                      <div className="relative w-24">
                        <Input 
                          type="number" step="0.1" value={item.weight} 
                          onChange={(e) => handleItemChange(idx, 'weight', e.target.value)}
                          required className="pr-8"
                        />
                        <span className="absolute right-2 top-2 text-xs text-gray-500">kg</span>
                      </div>
                      {idx > 0 && <button type="button" onClick={() => setDepositItems(depositItems.filter((_, i) => i !== idx))} className="text-red-500 font-bold px-2">✕</button>}
                    </div>
                  ))}
                  <Button type="button" variant="outline" className="w-full mt-2 text-[#004d33] border-[#004d33] hover:bg-[#004d33]/5" onClick={() => setDepositItems([...depositItems, { wasteTypeId: '', weight: '' }])}>
                    Tambah jenis sampah
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t pt-4">
                <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={!selectedNasabahId} className="bg-[#004d33] text-white disabled:bg-gray-300">Simpan</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* Modal Detail Setoran */}
      {isDetailModalOpen && selectedDeposit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg bg-card overflow-hidden shadow-xl">
            <CardHeader className="flex flex-row items-start justify-between pb-4 border-b">
              <div>
                <CardTitle>Detail Setoran</CardTitle>
                <CardDescription className="mt-1">{selectedDeposit.nasabah.name} - {selectedDeposit.nasabah.nasabahId}</CardDescription>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex gap-12 text-sm">
                <div><p className="text-gray-500 mb-1">Tanggal</p><p className="font-medium text-gray-900">{new Date(selectedDeposit.createdAt).toLocaleDateString('id-ID')}</p></div>
                <div><p className="text-gray-500 mb-1">Waktu</p><p className="font-medium text-gray-900">{new Date(selectedDeposit.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p></div>
                <div><p className="text-gray-500 mb-1">Nama</p><p className="font-medium text-gray-900">{selectedDeposit.nasabah.name}</p></div>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="text-gray-500 border-b">
                  <tr><th className="pb-2 font-medium">Jenis Sampah</th><th className="pb-2 font-medium">Berat (kg)</th><th className="pb-2 font-medium">Harga/kg</th><th className="pb-2 font-medium text-right">Sub Total</th></tr>
                </thead>
                <tbody className="divide-y">
                  {selectedDeposit.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-3 font-medium text-gray-900">{item.wasteType.name}</td>
                      <td className="py-3">{item.weight}</td>
                      <td className="py-3">Rp. {item.wasteType.pricePerKg.toLocaleString('id-ID')}</td>
                      <td className="py-3 text-right font-medium">Rp. {item.subtotal.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center text-sm font-medium pt-2 text-gray-500">
                <span>Total Berat</span><span>{selectedDeposit.totalWeight}kg</span>
              </div>
            </CardContent>
            <div className="bg-[#004d33] p-6 flex justify-between items-center text-white">
              <span className="font-medium text-lg">Total harga</span>
              <span className="font-bold text-2xl">Rp. {selectedDeposit.totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}