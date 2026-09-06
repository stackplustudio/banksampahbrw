'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Calendar, Download, Plus, FolderOpen, ChevronLeft, ChevronRight, X, ChevronDown, Eye } from 'lucide-react';

interface WasteItemInput {
  wasteTypeId: string;
  weight: string;
}

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
        className="w-full bg-white h-11 pr-10 shadow-sm border-gray-200 focus-visible:ring-[#004d33]/20"
        required={!value}
      />
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.slice(0, 10).map(o => ( // PERBAIKAN: Limit 10 items
            <div 
              key={o.value} 
              className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0"
              onMouseDown={() => { onChange(o.value); setSearch(''); setIsOpen(false); }}
            >
              {o.label}
            </div>
          ))}
          {filtered.length === 0 && <div className="p-3 text-sm text-gray-500 text-center">Tidak ditemukan</div>}
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterNasabahId, setFilterNasabahId] = useState('');

  // Paginasi State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null);

  // Form States
  const [selectedNasabahId, setSelectedNasabahId] = useState('');
  const [depositItems, setDepositItems] = useState<WasteItemInput[]>([{ wasteTypeId: '', weight: '' }]);

  const fetchData = async () => {
    try {
      const [depRes, userRes, wasteRes] = await Promise.all([
        api.get('/deposits'),
        api.get('/users'),
        api.get('/waste-types')
      ]);
      const sortedDeposits = depRes.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setDeposits(sortedDeposits);
      setNasabahList(userRes.data.filter((u: any) => u.status === 'AKTIF'));
      setWasteTypes(wasteRes.data);
    } catch (error) {
      toast.error('Gagal memuat data setoran');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Reset Halaman jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, filterNasabahId, itemsPerPage]);

  // Logika Filter
  const filteredDeposits = deposits.filter(d => {
    const dDate = d.createdAt.split('T')[0];
    const matchStartDate = startDate ? dDate >= startDate : true;
    const matchEndDate = endDate ? dDate <= endDate : true;
    const matchNasabah = filterNasabahId ? (d.nasabahId === filterNasabahId || d.nasabah?.id === filterNasabahId) : true;
    return matchStartDate && matchEndDate && matchNasabah;
  });

  // Logika Paginasi
  const totalItems = filteredDeposits.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentDeposits = filteredDeposits.slice(startIndex, endIndex);

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

  const handleItemChange = (index: number, field: keyof WasteItemInput, value: string) => {
    const newItems = [...depositItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setDepositItems(newItems);
  };

  const removeItemRow = (index: number) => {
    if (depositItems.length > 1) {
      setDepositItems(depositItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNasabahId) {
      toast.error('Pilih nasabah terlebih dahulu');
      return;
    }

    const formattedItems = depositItems.map(item => {
      const waste = wasteTypes.find(w => w.id === item.wasteTypeId);
      const weight = parseFloat(item.weight) || 0;
      return { 
        wasteTypeId: item.wasteTypeId, 
        weight: weight, 
        subtotal: waste ? Math.round(weight * waste.pricePerKg) : 0 
      };
    }).filter(item => item.wasteTypeId && item.weight > 0);

    if (formattedItems.length === 0) {
      toast.error('Masukkan minimal 1 jenis sampah dengan berat lebih dari 0 kg');
      return;
    }

    const loadingToast = toast.loading('Menyimpan setoran...');
    try {
      await api.post('/deposits', { nasabahId: selectedNasabahId, items: formattedItems });
      setIsAddModalOpen(false);
      setSelectedNasabahId('');
      setDepositItems([{ wasteTypeId: '', weight: '' }]);
      fetchData();
      toast.success('Setoran sampah berhasil dicatat!', { id: loadingToast });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Gagal mencatat setoran';
      toast.error(errorMsg, { id: loadingToast });
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
    XLSX.writeFile(workbook, `Data_Setoran_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const nasabahOptions = nasabahList.map(n => ({ value: n.id, label: `${n.name} (${n.nasabahId})` }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Toolbar Filter Sesuai Figma */}
      <div className="flex justify-between items-center bg-white p-2 rounded-lg mb-2">
        <div className="flex gap-4 items-center">
          {/* Filter Tanggal */}
          <div className="flex gap-2 items-center border border-gray-200 px-3 py-2 rounded-md shadow-sm text-sm bg-white h-11">
            <Calendar size={16} className="text-gray-500" />
            <Input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              className="h-7 border-none shadow-none text-sm w-[115px] px-1 focus-visible:ring-0 text-gray-600" 
            />
            <span className="text-gray-400">-</span>
            <Input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              className="h-7 border-none shadow-none text-sm w-[115px] px-1 focus-visible:ring-0 text-gray-600" 
            />
          </div>
          
          {/* PERBAIKAN: Filter Nasabah dengan Searchable Select */}
          <div className="relative w-64">
             <SearchableSelect 
               options={[{value: '', label: 'Semua Nasabah'}, ...nasabahOptions]} 
               value={filterNasabahId} 
               onChange={setFilterNasabahId} 
               placeholder="Cari Nasabah..." 
             />
          </div>
        </div>

        <div className="flex gap-3">
          {/* PERBAIKAN: Tombol Eksport disabled jika tanggal kosong */}
          <Button 
            variant="outline" 
            onClick={handleExportExcel} 
            disabled={!startDate || !endDate} 
            className="flex gap-2 items-center border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 h-11"
          >
            <Download size={16} /> Eksport
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex gap-2 items-center bg-[#004d33] hover:bg-[#003322] text-white shadow-sm h-11">
            <Plus size={16} /> Catat Setoran
          </Button>
        </div>
      </div>

      {/* Area Data */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">Memuat data...</div>
      ) : filteredDeposits.length === 0 ? (
        /* Empty State */
        <div className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-24 bg-white/50">
          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 mb-4">
            <FolderOpen size={24} className="text-gray-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Belum ada data setoran</h3>
          <p className="text-sm text-gray-500 mb-6 text-center">Buat catatan setoran untuk menampilkan<br/>data ditabel</p>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex gap-2 items-center bg-[#004d33] hover:bg-[#003322] text-white h-11">
            <Plus size={16} /> Catat Setoran
          </Button>
        </div>
      ) : (
        /* Data Tabel */
        <Card className="overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
              <thead className="bg-gray-50/80 text-gray-900 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-[13px]">Tanggal</th>
                  <th className="px-6 py-4 font-semibold text-[13px]">Waktu</th>
                  <th className="px-6 py-4 font-semibold text-[13px]">ID</th>
                  <th className="px-6 py-4 font-semibold text-[13px]">Nama</th>
                  <th className="px-6 py-4 font-semibold text-[13px]">Total Berat</th>
                  <th className="px-6 py-4 font-semibold text-[13px]">Total Harga</th>
                  <th className="px-6 py-4 font-semibold text-[13px] text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentDeposits.map((item) => {
                  const date = new Date(item.createdAt);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">{date.toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</td>
                      <td className="px-6 py-4">{date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{item.nasabah?.nasabahId || '-'}</td>
                      <td className="px-6 py-4">{item.nasabah?.name || '-'}</td>
                      <td className="px-6 py-4 uppercase font-medium">{item.totalWeight}KG</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{item.totalAmount.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => { setSelectedDeposit(item); setIsDetailModalOpen(true); }}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors inline-flex"
                          title="Lihat Detail Setoran"
                        >
                          <Eye size={18} strokeWidth={1.8} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
      )}

      {/* Modal Tambah Setoran Sesuai Figma */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gray-900">Tambah Setoran</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto">
              <div className="p-6 space-y-6">
                
                {/* Pilih Nama Nasabah */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Nama</label>
                  <SearchableSelect 
                    options={nasabahOptions} 
                    value={selectedNasabahId} 
                    onChange={setSelectedNasabahId} 
                    placeholder="Pilih nama nasabah" 
                  />
                </div>

                {/* Jenis & Berat Sampah */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">Jenis & Berat Sampah</label>
                  
                  {depositItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      {/* Dropdown Jenis Sampah */}
                      <div className="relative flex-1">
                        <select 
                          className="appearance-none w-full h-11 rounded-md border border-gray-200 bg-white px-3.5 pr-10 text-sm outline-none shadow-sm focus:ring-2 focus:ring-[#004d33]/20 cursor-pointer text-gray-700 font-medium"
                          value={item.wasteTypeId}
                          onChange={(e) => handleItemChange(idx, 'wasteTypeId', e.target.value)}
                          required
                        >
                          <option value="">Pilih jenis sampah</option>
                          {wasteTypes.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>

                      {/* Tombol Hapus Baris (x) jika ada lebih dari 1 */}
                      {depositItems.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeItemRow(idx)} 
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                          title="Hapus baris"
                        >
                          <X size={16} />
                        </button>
                      )}

                      {/* Input Berat (kg) */}
                      <div className="relative w-28">
                        <Input 
                          type="number" 
                          step="0.1" 
                          min="0.1"
                          placeholder="0"
                          value={item.weight} 
                          onChange={(e) => handleItemChange(idx, 'weight', e.target.value)}
                          required 
                          className="h-11 pr-8 shadow-sm border-gray-200 focus-visible:ring-[#004d33]/20 text-sm"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">kg</span>
                      </div>
                    </div>
                  ))}

                  {/* Tombol Hijau Gelap: Tambah jenis sampah */}
                  <button 
                    type="button" 
                    onClick={() => setDepositItems([...depositItems, { wasteTypeId: '', weight: '' }])}
                    className="w-full h-11 mt-2 bg-[#004d33] hover:bg-[#003322] text-white rounded-md text-sm font-semibold transition-colors shadow-sm flex items-center justify-center"
                  >
                    Tambah jenis sampah
                  </button>
                </div>

              </div>
              
              <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 sticky bottom-0">
                <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)} className="font-medium text-gray-600 hover:text-gray-900">Batal</Button>
                <Button type="submit" className="bg-[#004d33] hover:bg-[#003322] text-white font-medium px-6 shadow-sm">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Setoran Sesuai Figma */}
      {isDetailModalOpen && selectedDeposit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
            
            {/* Header Modal */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Detail Setoran</h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  {selectedDeposit.nasabah?.name} - {selectedDeposit.nasabah?.nasabahId}
                </p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Meta Informasi */}
              <div className="flex gap-12 text-sm border-b border-gray-100 pb-5">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Tanggal</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedDeposit.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Waktu</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedDeposit.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Nama</p>
                  <p className="font-semibold text-gray-900">{selectedDeposit.nasabah?.name}</p>
                </div>
              </div>

              {/* Rincian Sampah */}
              <table className="w-full text-left text-sm">
                <thead className="text-[12px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="pb-3 font-semibold">Jenis Sampah</th>
                    <th className="pb-3 font-semibold text-center">Berat (kg)</th>
                    <th className="pb-3 font-semibold text-center">Harga/kg</th>
                    <th className="pb-3 font-semibold text-right">Sub Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {selectedDeposit.items?.map((item: any) => (
                    <tr key={item.id} className="text-gray-700">
                      <td className="py-3.5 font-medium">{item.wasteType?.name}</td>
                      <td className="py-3.5 text-center">{item.weight}</td>
                      {/* PERBAIKAN: Rendering Harga Historis (Subtotal / Weight) */}
                      <td className="py-3.5 text-center text-gray-500">
                        Rp. {item.weight > 0 ? (item.subtotal / item.weight).toLocaleString('id-ID') : '0'}
                      </td>
                      <td className="py-3.5 text-right font-medium text-gray-900">Rp. {item.subtotal?.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center text-sm pt-1 border-t border-gray-100">
                <span className="text-gray-500 font-medium">Total Berat</span>
                <span className="font-semibold text-gray-900">{selectedDeposit.totalWeight}kg</span>
              </div>
            </div>

            {/* Banner Hijau Gelap Sesuai Figma */}
            <div className="bg-[#004d33] px-6 py-5 flex justify-between items-center text-white">
              <span className="font-semibold text-base">Total harga</span>
              <span className="font-bold text-2xl tracking-tight">Rp. {selectedDeposit.totalAmount?.toLocaleString('id-ID')}</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}