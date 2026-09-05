'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Search, ChevronDown, Download, Plus, FolderOpen, SquarePen, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Nasabah {
  id: string;
  nasabahId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  createdAt: string;
  totalSetoranKg: number;
  totalHargaRp: number;
}

export default function AdminNasabahPage() {
  const [users, setUsers] = useState<Nasabah[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Paginasi State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addData, setAddData] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [addEmailError, setAddEmailError] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ id: '', name: '', email: '', password: '', phone: '', address: '', status: '' });
  const [editEmailError, setEditEmailError] = useState('');

  const fetchNasabah = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Gagal memuat nasabah', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNasabah(); }, []);

  // Reset ke halaman 1 jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, itemsPerPage]);

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || (u.phone && u.phone.includes(searchQuery));
    const matchStatus = statusFilter === 'Semua' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Logika Paginasi
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Helper untuk menghasilkan array nomor halaman (dengan elipsis)
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

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'ADD' | 'EDIT') => {
    const value = e.target.value;
    if (type === 'ADD') {
      setAddData({ ...addData, email: value });
      setAddEmailError(validateEmail(value) || value === '' ? '' : 'Format email tidak valid');
    } else {
      setEditData({ ...editData, email: value });
      setEditEmailError(validateEmail(value) || value === '' ? '' : 'Format email tidak valid');
    }
  };

  const isAddFormValid = addData.name.trim() !== '' && validateEmail(addData.email) && addData.password.length >= 6 && addData.password.trim() !== '' && addData.phone.trim() !== '' && addData.address.trim() !== '';
  const isEditFormValid = validateEmail(editData.email) && editData.phone.trim() !== '' && editData.address.trim() !== '';

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddFormValid) return;

    const loadingToast = toast.loading('Menyimpan data...');
    try {
      await api.post('/users', { ...addData, role: 'NASABAH' });
      setIsAddModalOpen(false);
      setAddData({ name: '', email: '', password: '', phone: '', address: '' });
      fetchNasabah();
      toast.success('Nasabah berhasil ditambahkan!', { id: loadingToast });
    } catch (error: any) {
      const errorResponse = error.response?.data?.message;
      const errorMessage = Array.isArray(errorResponse) 
        ? errorResponse.join(', ') 
        : (errorResponse || 'Terjadi kesalahan pada server.');
      
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  const openEditModal = (user: Nasabah) => {
    setEditData({ id: user.id, name: user.name, email: user.email, password: '', phone: user.phone || '', address: user.address || '', status: user.status });
    setEditEmailError('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditFormValid) return;
    try {
      const payload: any = { email: editData.email, phone: editData.phone, address: editData.address, status: editData.status };
      if (editData.password) payload.password = editData.password;
      await api.patch(`/users/${editData.id}`, payload);
      setIsEditModalOpen(false);
      fetchNasabah();
      toast.success('Data nasabah berhasil diperbarui!');
    } catch (error) {
      toast.error('Gagal memperbarui nasabah.');
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredUsers.map((user) => ({
      'ID': user.nasabahId, 'Nama': user.name, 'Tanggal Daftar': new Date(user.createdAt).toLocaleDateString('id-ID'),
      'No. Telp': user.phone, 'Alamat': user.address, 'Total Setoran (Kg)': user.totalSetoranKg,
      'Total Harga (Rp)': user.totalHargaRp, 'Status': user.status === 'AKTIF' ? 'Aktif' : 'Tidak Aktif'
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nasabah");
    worksheet['!cols'] = [{ wch: 10 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 35 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
    XLSX.writeFile(workbook, `Data_Nasabah_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Toolbar Filter Sesuai Figma */}
      <div className="flex justify-between items-center bg-white p-2 rounded-lg mb-2">
        <div className="flex gap-4 items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              placeholder="Cari nama atau no telp..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 bg-white shadow-sm border-gray-200 text-sm w-full focus-visible:ring-[#004d33]/20"
            />
          </div>
          <div className="relative">
            <select 
              className="appearance-none h-11 rounded-md border border-gray-200 bg-white pl-4 pr-10 text-sm outline-none w-40 shadow-sm focus:ring-2 focus:ring-[#004d33]/20 cursor-pointer text-gray-600 font-medium"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Semua">Status</option>
              <option value="AKTIF">Aktif</option>
              <option value="NONAKTIF">Tidak Aktif</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportExcel} className="flex gap-2 items-center border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 h-11">
            <Download size={16} /> Eksport
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex gap-2 items-center bg-[#004d33] hover:bg-[#003322] text-white shadow-sm h-11">
            <Plus size={16} /> Tambah nasabah
          </Button>
        </div>
      </div>

      {/* Area Data */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">Memuat data...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-24 bg-white/50">
          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 mb-4">
            <FolderOpen size={24} className="text-gray-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Belum ada nasabah</h3>
          <p className="text-sm text-gray-500 mb-6 text-center">Tambahkan nasabah untuk menampilkan<br/>data ditabel</p>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex gap-2 items-center bg-[#004d33] hover:bg-[#003322] text-white h-11">
            <Plus size={16} /> Tambah nasabah
          </Button>
        </div>
      ) : (
        <Card className="overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
              <thead className="bg-gray-50/80 text-gray-900 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-[13px]">ID</th>
                  <th className="px-6 py-4 font-semibold text-[13px]">Nama</th>
                  <th className="px-6 py-4 font-semibold text-[13px]">Tanggal</th>
                  <th className="px-6 py-4 font-semibold text-[13px]">No. Telp</th>
                  <th className="px-6 py-4 font-semibold text-[13px]">Alamat</th>
                  <th className="px-6 py-4 font-semibold text-[13px]">Total Setoran (kg)</th>
                  <th className="px-6 py-4 font-semibold text-[13px]">Total Harga (Rp)</th>
                  <th className="px-6 py-4 font-semibold text-[13px]">Status</th>
                  <th className="px-6 py-4 font-semibold text-[13px] text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* Perbaikan: Menggunakan currentUsers (data yang sudah dipotong paginasi) */}
                {currentUsers.map((item) => {
                  const date = new Date(item.createdAt);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.nasabahId}</td>
                      <td className="px-6 py-4">{item.name}</td>
                      <td className="px-6 py-4">{date.toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</td>
                      <td className="px-6 py-4">{item.phone || '-'}</td>
                      <td className="px-6 py-4 truncate max-w-[200px]" title={item.address}>{item.address || '-'}</td>
                      <td className="px-6 py-4">{item.totalSetoranKg.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4">{item.totalHargaRp.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border tracking-wide uppercase ${
                          item.status === 'AKTIF' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'AKTIF' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {item.status === 'AKTIF' ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => openEditModal(item)} 
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-100 transition-colors inline-flex" 
                          title="Edit Nasabah"
                        >
                          <SquarePen size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Fungsionalitas Paginasi Lengkap Sesuai Figma */}
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
      )}

      {/* Modal Tambah Nasabah */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gray-900">Tambah Nasabah</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="flex flex-col overflow-y-auto">
              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Nama</label>
                  <Input placeholder="Siti Aminah" value={addData.name} onChange={e => setAddData({...addData, name: e.target.value})} required className="h-11 shadow-sm border-gray-200 focus-visible:ring-[#004d33]/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <Input type="email" placeholder="sitiaminah@gmail.com" value={addData.email} onChange={e => handleEmailChange(e, 'ADD')} required className={`h-11 shadow-sm ${addEmailError ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:ring-[#004d33]/20'}`} />
                  {addEmailError && <p className="text-xs font-medium text-red-500 mt-1">{addEmailError}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={addData.password} 
                    onChange={e => setAddData({...addData, password: e.target.value})} 
                    required 
                    className="h-11 shadow-sm border-gray-200 focus-visible:ring-[#004d33]/20" 
                  />
                  {addData.password.length > 0 && addData.password.length < 6 && (
                    <p className="text-xs font-medium text-red-500 mt-1">Password minimal 6 karakter</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">No. Telp</label>
                  <Input type="tel" placeholder="081387383482" value={addData.phone} onChange={e => setAddData({...addData, phone: e.target.value})} required className="h-11 shadow-sm border-gray-200 focus-visible:ring-[#004d33]/20" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Alamat</label>
                  <textarea 
                    placeholder="Banjarum RT01/RW07" 
                    value={addData.address} 
                    onChange={e => setAddData({...addData, address: e.target.value})} 
                    required 
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#004d33]/20 focus:border-[#004d33] transition-all min-h-[100px] resize-y"
                  />
                </div>
              </div>
              
              <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 sticky bottom-0">
                <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)} className="font-medium text-gray-600 hover:text-gray-900">Batal</Button>
                <Button type="submit" disabled={!isAddFormValid} className="bg-[#004d33] hover:bg-[#003322] text-white disabled:bg-gray-300 font-medium px-6">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Nasabah */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gray-900">Edit Nasabah</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="flex flex-col overflow-y-auto">
              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Nama</label>
                  <Input value={editData.name} disabled className="h-11 bg-gray-50 text-gray-500 border-gray-200 shadow-sm cursor-not-allowed" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <Input type="email" value={editData.email} onChange={e => handleEmailChange(e, 'EDIT')} required className={`h-11 shadow-sm ${editEmailError ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:ring-[#004d33]/20'}`} />
                  {editEmailError && <p className="text-xs font-medium text-red-500 mt-1">{editEmailError}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <Input type="password" placeholder="Isi hanya jika ingin mengganti sandi" value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})} className="h-11 shadow-sm border-gray-200 focus-visible:ring-[#004d33]/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">No. Telp</label>
                  <Input type="tel" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} required className="h-11 shadow-sm border-gray-200 focus-visible:ring-[#004d33]/20" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Alamat</label>
                  <textarea 
                    value={editData.address} 
                    onChange={e => setEditData({...editData, address: e.target.value})} 
                    required 
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#004d33]/20 focus:border-[#004d33] transition-all min-h-[100px] resize-y"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Status</label>
                  <div className="relative">
                    <select 
                      className="appearance-none w-full h-11 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none shadow-sm focus:ring-2 focus:ring-[#004d33]/20 focus:border-[#004d33]"
                      value={editData.status}
                      onChange={e => setEditData({...editData, status: e.target.value})}
                    >
                      <option value="AKTIF">Aktif</option>
                      <option value="NONAKTIF">Tidak Aktif</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 sticky bottom-0">
                <Button variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)} className="font-medium text-gray-600 hover:text-gray-900">Batal</Button>
                <Button type="submit" disabled={!isEditFormValid} className="bg-[#004d33] hover:bg-[#003322] text-white disabled:bg-gray-300 font-medium px-6">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}