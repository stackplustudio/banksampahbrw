'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

interface WasteType {
  id: string;
  name: string;
  category: 'ORGANIK' | 'ANORGANIK';
  pricePerKg: number;
  totalWeight: number;
  totalAmount: number;
}

export default function AdminSampahPage() {
  const [wastes, setWastes] = useState<WasteType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState<WasteType | null>(null);

  // Form Data
  const [formData, setFormData] = useState({ name: '', category: 'ANORGANIK', price: '' });

  const fetchWastes = async () => {
    try {
      const res = await api.get('/waste-types');
      setWastes(res.data);
    } catch (error) {
      console.error('Gagal memuat data sampah', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWastes(); }, []);

  // Filter Logic
  const filteredWastes = wastes.filter(w => {
    const matchSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === 'Semua' || w.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  // Validation Logic
  const isFormValid = isEditModalOpen 
    ? formData.price !== '' 
    : formData.name.trim() !== '' && formData.price !== '' && formData.category !== '';

  // Handlers
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    try {
      await api.post('/waste-types', {
        name: formData.name,
        category: formData.category,
        pricePerKg: parseFloat(formData.price),
      });
      setIsAddModalOpen(false);
      setFormData({ name: '', category: 'ANORGANIK', price: '' });
      fetchWastes();
    } catch (error) {
      alert('Gagal menambah jenis sampah');
    }
  };

  const openEditModal = (waste: WasteType) => {
    setSelectedWaste(waste);
    setFormData({ name: waste.name, category: waste.category, price: waste.pricePerKg.toString() });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWaste || !isFormValid) return;
    try {
      await api.patch(`/waste-types/${selectedWaste.id}`, {
        name: formData.name,
        category: formData.category,
        pricePerKg: parseFloat(formData.price),
      });
      setIsEditModalOpen(false);
      fetchWastes();
    } catch (error) {
      alert('Gagal mengedit jenis sampah');
    }
  };

  const openDeleteModal = (waste: WasteType) => {
    setSelectedWaste(waste);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedWaste) return;
    try {
      await api.delete(`/waste-types/${selectedWaste.id}`);
      setIsDeleteModalOpen(false);
      fetchWastes();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus jenis sampah');
      setIsDeleteModalOpen(false);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredWastes.map((w, i) => ({
      'No': i + 1,
      'Jenis Sampah': w.name,
      'Kategori': w.category === 'ANORGANIK' ? 'Anorganik' : 'Organik',
      'Satuan': 'kg',
      'Harga/Satuan (Rp)': w.pricePerKg,
      'Total Sampah (kg)': w.totalWeight,
      'Total Saldo (Rp)': w.totalAmount
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Master Sampah");
    worksheet['!cols'] = [{ wch: 5 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
    XLSX.writeFile(workbook, `Master_Sampah_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const totalKeseluruhanSampah = filteredWastes.reduce((sum, w) => sum + w.totalWeight, 0);
  const totalKeseluruhanSaldo = filteredWastes.reduce((sum, w) => sum + w.totalAmount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Sampah</h1>
          <p className="text-gray-500 text-sm">Kelola data jenis sampah yang diterima.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportExcel}>Eksport</Button>
          <Button onClick={() => {
            setFormData({ name: '', category: 'ANORGANIK', price: '' });
            setIsAddModalOpen(true);
          }}>+ Tambah jenis sampah</Button>
        </div>
      </div>

      {/* Filter & Search Section */}
      <div className="flex gap-4 items-center">
        <select 
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none w-48 shadow-sm"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="Semua">Semua Kategori</option>
          <option value="ORGANIK">Organik</option>
          <option value="ANORGANIK">Anorganik</option>
        </select>
        <Input 
          placeholder="Cari nama jenis sampah..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64 bg-white shadow-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-10">Memuat...</div>
      ) : filteredWastes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-24 border-dashed border-2 bg-white">
          <div className="text-gray-400 mb-4 text-4xl">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada data jenis sampah</h3>
          <p className="text-sm text-gray-500 mb-6">Tambah jenis sampah untuk menampilkan data ditabel</p>
          <Button onClick={() => setIsAddModalOpen(true)}>+ Tambah sampah</Button>
        </Card>
      ) : (
        <>
          <Card className="overflow-x-auto shadow-sm">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-900 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">No</th>
                  <th className="px-6 py-4 font-medium">Jenis Sampah</th>
                  <th className="px-6 py-4 font-medium">Kategori</th>
                  <th className="px-6 py-4 font-medium">Satuan</th>
                  <th className="px-6 py-4 font-medium">Harga/Satuan (Rp)</th>
                  <th className="px-6 py-4 font-medium">Total Sampah (kg)</th>
                  <th className="px-6 py-4 font-medium">Total Saldo (Rp)</th>
                  <th className="px-6 py-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredWastes.map((item, idx) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4 capitalize">{item.category.toLowerCase()}</td>
                    <td className="px-6 py-4">kg</td>
                    <td className="px-6 py-4">Rp. {item.pricePerKg.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">{item.totalWeight}kg</td>
                    <td className="px-6 py-4">Rp. {item.totalAmount.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => openEditModal(item)} className="text-blue-600 hover:underline mr-3">Edit</button>
                      <button onClick={() => openDeleteModal(item)} className="text-red-600 hover:underline">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-[#004d33] text-white border-none flex items-center p-6 gap-4 shadow-sm">
              <div className="bg-white/20 p-3 rounded-lg text-2xl">🍃</div>
              <div>
                <p className="text-green-100 text-sm">Total Keseluruhan Sampah (kg)</p>
                <h3 className="text-3xl font-bold">{totalKeseluruhanSampah} kg</h3>
              </div>
            </Card>
            <Card className="bg-blue-500 text-white border-none flex items-center p-6 gap-4 shadow-sm">
              <div className="bg-white/20 p-3 rounded-lg text-2xl">💵</div>
              <div>
                <p className="text-blue-100 text-sm">Total Keseluruhan Saldo (Rp)</p>
                <h3 className="text-3xl font-bold">Rp. {totalKeseluruhanSaldo.toLocaleString('id-ID')}</h3>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Modal Tambah/Edit */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm bg-card shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{isEditModalOpen ? 'Edit Harga' : 'Tambah jenis sampah'}</CardTitle>
              <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </CardHeader>
            <form onSubmit={isEditModalOpen ? handleEditSubmit : handleAddSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Jenis Sampah</label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    disabled={isEditModalOpen} 
                    className={isEditModalOpen ? "bg-gray-100 text-gray-500" : ""}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kategori sampah</label>
                  <div className="flex flex-col gap-2 mt-1">
                    <label className={`flex items-center gap-2 ${isEditModalOpen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input 
                        type="radio" 
                        name="category" 
                        value="ORGANIK" 
                        checked={formData.category === 'ORGANIK'} 
                        onChange={e => setFormData({...formData, category: 'ORGANIK'})} 
                        disabled={isEditModalOpen}
                        className="accent-primary" 
                      />
                      <span className="text-sm">Organik</span>
                    </label>
                    <label className={`flex items-center gap-2 ${isEditModalOpen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input 
                        type="radio" 
                        name="category" 
                        value="ANORGANIK" 
                        checked={formData.category === 'ANORGANIK'} 
                        onChange={e => setFormData({...formData, category: 'ANORGANIK'})} 
                        disabled={isEditModalOpen}
                        className="accent-primary" 
                      />
                      <span className="text-sm">Anorganik</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Harga</label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})} 
                      required 
                      className="pr-10" 
                    />
                    <span className="absolute right-3 top-2 text-sm text-gray-500">/kg</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t pt-4">
                <Button variant="ghost" type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}>Batal</Button>
                <Button 
                  type="submit" 
                  disabled={!isFormValid}
                  className="bg-[#004d33] hover:bg-[#004d33]/90 text-white disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {isEditModalOpen ? 'Simpan Perubahan' : 'Tambah'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* Modal Hapus */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm bg-card text-center p-6 shadow-lg">
            <div className="flex justify-end mb-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
              🗑️
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Jenis Sampah</h3>
            <p className="text-sm text-gray-500 mb-6">Anda yakin ingin menghapus jenis sampah ini<br/>Tidak bisa mengembalikan data yang sudah dihapus</p>
            <div className="flex gap-3 w-full">
              <Button onClick={handleDeleteConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Hapus</Button>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="flex-1">Batal</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}