'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

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
  
  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // States Modal Tambah
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addData, setAddData] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [addEmailError, setAddEmailError] = useState('');

  // States Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ id: '', name: '', email: '', password: '', phone: '', address: '', status: '' });
  const [editEmailError, setEditEmailError] = useState('');

  const fetchNasabah = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.filter((u: any) => u.role === 'NASABAH'));
    } catch (error) {
      console.error('Gagal memuat nasabah', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNasabah(); }, []);

  // Logika Filter & Pencarian
  const filteredUsers = users.filter(u => {
    const matchSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (u.phone && u.phone.includes(searchQuery));
    const matchStatus = statusFilter === 'Semua' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Validasi Email Regex
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

  // Validasi Status Tombol Simpan
  const isAddFormValid = 
    addData.name.trim() !== '' && 
    validateEmail(addData.email) && 
    addData.password.trim() !== '' && 
    addData.phone.trim() !== '' && 
    addData.address.trim() !== '';

  const isEditFormValid = 
    validateEmail(editData.email) && 
    editData.phone.trim() !== '' && 
    editData.address.trim() !== '';

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddFormValid) return;
    try {
      await api.post('/users', { ...addData, role: 'NASABAH' });
      setIsAddModalOpen(false);
      setAddData({ name: '', email: '', password: '', phone: '', address: '' });
      fetchNasabah();
    } catch (error) {
      alert('Gagal menambah nasabah. Pastikan email belum digunakan.');
    }
  };

  const openEditModal = (user: Nasabah) => {
    setEditData({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      password: '', 
      phone: user.phone || '', 
      address: user.address || '', 
      status: user.status 
    });
    setEditEmailError('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditFormValid) return;
    try {
      const payload: any = { 
        email: editData.email, 
        phone: editData.phone,
        address: editData.address,
        status: editData.status 
      };
      if (editData.password) payload.password = editData.password;

      await api.patch(`/users/${editData.id}`, payload);
      setIsEditModalOpen(false);
      fetchNasabah();
    } catch (error) {
      alert('Gagal memperbarui nasabah.');
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredUsers.map((user) => ({
      'ID': user.nasabahId,
      'Nama': user.name,
      'Tanggal Daftar': new Date(user.createdAt).toLocaleDateString('id-ID'),
      'No. Telp': user.phone,
      'Alamat': user.address,
      'Total Setoran (Kg)': user.totalSetoranKg,
      'Total Harga (Rp)': user.totalHargaRp,
      'Status': user.status === 'AKTIF' ? 'Aktif' : 'Tidak Aktif'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nasabah");
    worksheet['!cols'] = [{ wch: 10 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 35 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
    XLSX.writeFile(workbook, `Data_Nasabah_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Nasabah</h1>
          <p className="text-gray-500 text-sm">Daftar seluruh nasabah terdaftar.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportExcel}>Eksport</Button>
          <Button onClick={() => setIsAddModalOpen(true)}>+ Tambah Nasabah</Button>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="flex gap-4 items-center">
        <Input 
          placeholder="Cari nama atau no telp..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64 bg-white shadow-sm"
        />
        <select 
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none w-48 shadow-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="Semua">Semua Status</option>
          <option value="AKTIF">Aktif</option>
          <option value="NONAKTIF">Tidak Aktif</option>
        </select>
      </div>

      <Card className="overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 border-b">
            <tr>
              <th className="px-6 py-4 font-medium">ID</th>
              <th className="px-6 py-4 font-medium">Nama</th>
              <th className="px-6 py-4 font-medium">Tanggal</th>
              <th className="px-6 py-4 font-medium">No. Telp</th>
              <th className="px-6 py-4 font-medium">Alamat</th>
              <th className="px-6 py-4 font-medium">Total Setoran (kg)</th>
              <th className="px-6 py-4 font-medium">Total Harga (Rp)</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-8">Memuat data...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-8 text-gray-400">Tidak ada data nasabah ditemukan.</td></tr>
            ) : filteredUsers.map((item) => {
              const date = new Date(item.createdAt);
              return (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{item.nasabahId}</td>
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4">{date.toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4">{item.phone}</td>
                  <td className="px-6 py-4">{item.address}</td>
                  <td className="px-6 py-4">{item.totalSetoranKg}</td>
                  <td className="px-6 py-4">{item.totalHargaRp.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      item.status === 'AKTIF' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      • {item.status === 'AKTIF' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => openEditModal(item)} className="text-blue-600 hover:underline">Edit</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Modal Tambah Nasabah */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-card max-h-[90vh] overflow-y-auto shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle>Tambah Nasabah</CardTitle>
            </CardHeader>
            <form onSubmit={handleAddSubmit}>
              <CardContent className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Nama</label>
                  <Input placeholder="Siti Aminah" value={addData.name} onChange={e => setAddData({...addData, name: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email" 
                    placeholder="sitiaminah@gmail.com" 
                    value={addData.email} 
                    onChange={e => handleEmailChange(e, 'ADD')} 
                    className={addEmailError ? 'border-red-500' : ''}
                    required 
                  />
                  {addEmailError && <p className="text-xs text-red-500">{addEmailError}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Password</label>
                  <Input type="password" placeholder="••••••••" value={addData.password} onChange={e => setAddData({...addData, password: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">No. Telp</label>
                  <Input type="tel" placeholder="081387383482" value={addData.phone} onChange={e => setAddData({...addData, phone: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Alamat</label>
                  <Input placeholder="Banjarum RT01/RW07" value={addData.address} onChange={e => setAddData({...addData, address: e.target.value})} required />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t pt-4">
                <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={!isAddFormValid} className="bg-[#004d33] text-white disabled:bg-gray-300">Simpan</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* Modal Edit Nasabah */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-card max-h-[90vh] overflow-y-auto shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle>Edit Nasabah</CardTitle>
            </CardHeader>
            <form onSubmit={handleEditSubmit}>
              <CardContent className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Nama</label>
                  <Input value={editData.name} disabled className="bg-gray-100 text-gray-500" required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email" 
                    value={editData.email} 
                    onChange={e => handleEmailChange(e, 'EDIT')} 
                    className={editEmailError ? 'border-red-500' : ''}
                    required 
                  />
                  {editEmailError && <p className="text-xs text-red-500">{editEmailError}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Password</label>
                  <Input type="password" placeholder="Isi untuk mengganti sandi" value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">No. Telp</label>
                  <Input type="tel" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Alamat</label>
                  <Input value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    value={editData.status}
                    onChange={e => setEditData({...editData, status: e.target.value})}
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="NONAKTIF">Tidak Aktif</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t pt-4">
                <Button variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={!isEditFormValid} className="bg-[#004d33] text-white disabled:bg-gray-300">Simpan</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}