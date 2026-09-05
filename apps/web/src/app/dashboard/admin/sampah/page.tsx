'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { ChevronDown, Download, Plus, FolderOpen, SquarePen, Trash2, ChevronLeft, ChevronRight, X, Leaf, Banknote } from 'lucide-react';

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

  // Filter
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  // Paginasi State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      toast.error('Gagal memuat data sampah');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWastes(); }, []);

  // Reset Halaman jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, itemsPerPage]);

  // Logika Filter
  const filteredWastes = wastes.filter(w => {
    return categoryFilter === 'Semua' || w.category === categoryFilter;
  });

  // Logika Paginasi
  const totalItems = filteredWastes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentWastes = filteredWastes.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  // Validasi Form
  const isFormValid = formData.name.trim() !== '' && formData.price !== '' && formData.category !== '';

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    const loadingToast = toast.loading('Menyimpan jenis sampah...');
    try {
      await api.post('/waste-types', {
        name: formData.name,
        category: formData.category,
        pricePerKg: parseFloat(formData.price),
      });
      setIsAddModalOpen(false);
      setFormData({ name: '', category: 'ANORGANIK', price: '' });
      fetchWastes();
      toast.success('Jenis sampah berhasil ditambahkan!', { id: loadingToast });
    } catch (error) {
      toast.error('Gagal menambah jenis sampah', { id: loadingToast });
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
    const loadingToast = toast.loading('Memperbarui data...');
    try {
      await api.patch(`/waste-types/${selectedWaste.id}`, {
        name: formData.name,
        category: formData.category,
        pricePerKg: parseFloat(formData.price),
      });
      setIsEditModalOpen(false);
      fetchWastes();
      toast.success('Data sampah diperbarui!', { id: loadingToast });
    } catch (error) {
      toast.error('Gagal mengedit jenis sampah', { id: loadingToast });
    }
  };

  const openDeleteModal = (waste: WasteType) => {
    setSelectedWaste(waste);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedWaste) return;
    const loadingToast = toast.loading('Menghapus data...');
    try {
      await api.delete(`/waste-types/${selectedWaste.id}`);
      setIsDeleteModalOpen(false);
      fetchWastes();
      toast.success('Jenis sampah dihapus!', { id: loadingToast });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus jenis sampah', { id: loadingToast });
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
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Toolbar Filter Sesuai Figma */}
      <div className="flex justify-between items-center bg-white p-2 rounded-lg mb-2">
        <div className="relative w-56">
          <select 
            className="appearance-none w-full h-11 rounded-md border border-gray-200 bg-white pl-4 pr-10 text-sm outline-none shadow-sm focus:ring-2 focus:ring-[#004d33]/20 cursor-pointer text-gray-600 font-medium"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="Semua">Semua Sampah</option>
            <option value="ORGANIK">Organik</option>
            <option value="ANORGANIK">Anorganik</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportExcel} className="flex gap-2 items-center border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 h-11">
            <Download size={16} /> Eksport
          </Button>
          <Button onClick={() => {
            setFormData({ name: '', category: 'ANORGANIK', price: '' });
            setIsAddModalOpen(true);
          }} className="flex gap-2 items-center bg-[#004d33] hover:bg-[#003322] text-white shadow-sm h-11">
            <Plus size={16} /> Tambah jenis sampah
          </Button>
        </div>
      </div>

      {/* Area Data */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">Memuat data...</div>
      ) : filteredWastes.length === 0 ? (
        /* Empty State */
        <div className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-24 bg-white/50">
          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 mb-4">
            <FolderOpen size={24} className="text-gray-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Belum ada data jenis sampah</h3>
          <p className="text-sm text-gray-500 mb-6 text-center">Tambahkan jenis sampah untuk menampilkan<br/>data ditabel</p>
          <Button onClick={() => {
            setFormData({ name: '', category: 'ANORGANIK', price: '' });
            setIsAddModalOpen(true);
          }} className="flex gap-2 items-center bg-[#004d33] hover:bg-[#003322] text-white h-11">
            <Plus size={16} /> Tambah sampah
          </Button>
        </div>
      ) : (
        <>
          <Card className="overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
                <thead className="bg-gray-50/80 text-gray-900 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-[13px] w-16">No</th>
                    <th className="px-6 py-4 font-semibold text-[13px]">Jenis Sampah</th>
                    <th className="px-6 py-4 font-semibold text-[13px]">Kategori</th>
                    <th className="px-6 py-4 font-semibold text-[13px]">Satuan</th>
                    <th className="px-6 py-4 font-semibold text-[13px]">Harga/Satuan (Rp)</th>
                    <th className="px-6 py-4 font-semibold text-[13px]">Total Sampah (kg)</th>
                    <th className="px-6 py-4 font-semibold text-[13px]">Total Saldo (Rp)</th>
                    <th className="px-6 py-4 font-semibold text-[13px] text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentWastes.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">{startIndex + idx + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 capitalize">{item.category.toLowerCase()}</td>
                      <td className="px-6 py-4">kg</td>
                      <td className="px-6 py-4">Rp. {item.pricePerKg.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 font-medium">{item.totalWeight}kg</td>
                      <td className="px-6 py-4 font-medium text-gray-900">Rp. {item.totalAmount.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-center">
                        {/* Ikon Edit */}
                        <button 
                          onClick={() => openEditModal(item)} 
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-100 transition-colors inline-flex mr-2" 
                          title="Edit Sampah"
                        >
                          <SquarePen size={16} />
                        </button>
                        {/* Ikon Hapus */}
                        <button 
                          onClick={() => openDeleteModal(item)} 
                          className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-100 transition-colors inline-flex" 
                          title="Hapus Sampah"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginasi Visual */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white text-sm">
              <span className="text-gray-500 font-medium">
                Menampilkan {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} dari {totalItems} data
              </span>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                >
                  <ChevronLeft size={18} strokeWidth={2.5} />
                </button>
                
                {getPageNumbers().map((pageNum, idx) => (
                  pageNum === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 font-medium">...</span>
                  ) : (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(pageNum as number)}
                      className={`w-8 h-8 rounded-md flex items-center justify-center font-semibold transition-colors text-[13px] ${
                        currentPage === pageNum 
                          ? 'bg-[#004d33] text-white shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                ))}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                >
                  <ChevronRight size={18} strokeWidth={2.5} />
                </button>

                <div className="relative ml-4">
                  <select 
                    className="appearance-none h-8 rounded-md border border-gray-200 bg-white pl-3 pr-8 text-[13px] outline-none shadow-sm focus:ring-2 focus:ring-[#004d33]/20 cursor-pointer text-gray-700 font-semibold"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    <option value={10}>10/Halaman</option>
                    <option value={50}>50/Halaman</option>
                    <option value={100}>100/Halaman</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </Card>

          {/* Banner Summary Bawah Sesuai Figma */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 p-5 flex items-center gap-5">
              <div className="w-14 h-14 bg-[#004d33] rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                <Leaf size={28} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[12px] text-gray-500 font-semibold mb-0.5">Total Keseluruhan Sampah (kg)</p>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{totalKeseluruhanSampah.toLocaleString('id-ID')} kg</h3>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 p-5 flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                <Banknote size={28} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[12px] text-gray-500 font-semibold mb-0.5">Total Keseluruhan Saldo (Rp)</p>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Rp. {totalKeseluruhanSaldo.toLocaleString('id-ID')}</h3>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Tambah/Edit Sesuai Figma */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-gray-900">{isEditModalOpen ? 'Edit Harga' : 'Tambah jenis sampah'}</h2>
              <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={isEditModalOpen ? handleEditSubmit : handleAddSubmit} className="flex flex-col">
              <div className="p-6 space-y-6">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Jenis Sampah</label>
                  <Input 
                    placeholder="Contoh: Plastik"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className={`h-11 shadow-sm border-gray-200 focus-visible:ring-[#004d33]/20 ${isEditModalOpen ? 'bg-gray-50 text-gray-500' : ''}`}
                    required 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">Kategori sampah</label>
                  <div className="flex flex-col gap-3">
                    <label className={`flex items-center gap-3 ${isEditModalOpen ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input 
                        type="radio" 
                        name="category" 
                        value="ORGANIK" 
                        checked={formData.category === 'ORGANIK'} 
                        onChange={e => setFormData({...formData, category: 'ORGANIK'})} 
                        disabled={isEditModalOpen}
                        className="w-4 h-4 text-[#004d33] focus:ring-[#004d33]" 
                      />
                      <span className="text-sm font-medium text-gray-700">Organik</span>
                    </label>
                    <label className={`flex items-center gap-3 ${isEditModalOpen ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input 
                        type="radio" 
                        name="category" 
                        value="ANORGANIK" 
                        checked={formData.category === 'ANORGANIK'} 
                        onChange={e => setFormData({...formData, category: 'ANORGANIK'})} 
                        disabled={isEditModalOpen}
                        className="w-4 h-4 text-[#004d33] focus:ring-[#004d33]" 
                      />
                      <span className="text-sm font-medium text-gray-700">Anorganik</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Harga</label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      placeholder="5.000"
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})} 
                      required 
                      className="h-11 shadow-sm border-gray-200 focus-visible:ring-[#004d33]/20 pr-12" 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">/kg</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{isEditModalOpen ? 'Edit harga dari jenis sampah' : 'Masukkan harga dari jenis sampah'}</p>
                </div>

              </div>
              
              <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                <Button variant="ghost" type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="font-medium text-gray-600 hover:text-gray-900">Batal</Button>
                <Button type="submit" disabled={!isFormValid} className="bg-[#004d33] hover:bg-[#003322] text-white disabled:bg-gray-300 font-medium px-6 transition-colors">
                  {isEditModalOpen ? 'Simpan Perubahan' : 'Tambah'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Sesuai Figma */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden p-6 relative text-center">
            <button onClick={() => setIsDeleteModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100">
              <Trash2 size={24} />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Jenis Sampah</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Anda yakin ingin menghapus jenis sampah ini<br/>
              Tidak bisa mengembalikan data yang sudah dihapus
            </p>
            
            <div className="flex gap-3 w-full">
              <Button onClick={handleDeleteConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium h-11">Hapus</Button>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 font-medium h-11 border-gray-200 text-gray-700">Batal</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}