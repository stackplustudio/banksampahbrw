'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function NasabahProfil() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  
  const [phoneInput, setPhoneInput] = useState('');
  const [addressInput, setAddressInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    api.get('/nasabah/profile').then(res => {
      const userData = res.data.user;
      setProfile(userData);
      setPhoneInput(userData.phone || '');
      setAddressInput(userData.address || '');
    }).catch(console.error);
  };

  const handleUpdate = async (field: 'phone' | 'address') => {
    try {
      await api.patch('/nasabah/profile', {
        phone: field === 'phone' ? phoneInput : profile.phone,
        address: field === 'address' ? addressInput : profile.address
      });
      setIsEditingPhone(false);
      setIsEditingAddress(false);
      fetchProfile();
    } catch (error) {
      alert('Gagal memperbarui profil');
    }
  };

  // LOGIKA INISIAL NAMA UNTUK AVATAR PROFIL
  const getInitials = (name?: string) => {
    if (!name) return 'SA';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!profile) return <div className="p-8 text-center text-gray-500">Memuat Profil...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-12 bg-white p-8 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.04)] items-start mt-2">
        <div className="flex flex-col items-center md:border-r border-gray-100 md:pr-12 w-full md:w-auto">
          {/* PERBAIKAN INISIAL AVATAR BESAR */}
          <div className="w-32 h-32 bg-[#F5F7F0] rounded-full overflow-hidden mb-5 border-4 border-white shadow-sm flex items-center justify-center text-4xl text-gray-500 font-bold">
            {getInitials(profile.name)}
          </div>
          <h3 className="font-bold text-lg text-gray-900 text-center">{profile.name}</h3>
          <p className="text-sm text-gray-500 font-medium mt-1">{profile.nasabahId}</p>
        </div>

        <div className="flex-1 w-full space-y-6">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Informasi Pribadi</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1">ID Nasabah</label>
              <p className="font-medium text-gray-900">{profile.nasabahId}</p>
            </div>
            
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1">Nama Lengkap</label>
              <p className="font-medium text-gray-900">{profile.name}</p>
            </div>
            
            <div className="border-b border-gray-100 pb-5">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1">Alamat Email</label>
              <p className="font-medium text-gray-900">{profile.email}</p>
            </div>
            
            <div className="flex justify-between items-start border-b border-gray-100 pb-5">
              <div className="flex-1 mr-6">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1">Nomor Telepon</label>
                {isEditingPhone ? (
                  <Input value={phoneInput} onChange={e => setPhoneInput(e.target.value)} className="mt-2 h-10 w-full md:w-64" placeholder="Masukkan nomor telepon" />
                ) : (
                  <p className="font-medium text-gray-900 mt-1">{profile.phone || '-'}</p>
                )}
              </div>
              <div className="pt-2">
                {isEditingPhone ? (
                  <Button onClick={() => handleUpdate('phone')} size="sm" className="bg-[#004d33] text-white hover:bg-[#003322]">Simpan</Button>
                ) : (
                  <Button size="sm" onClick={() => setIsEditingPhone(true)} className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-5 text-xs h-8">Ubah</Button>
                )}
              </div>
            </div>

            <div className="flex justify-between items-start pb-2">
              <div className="flex-1 mr-6">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1">Alamat Tempat Tinggal</label>
                {isEditingAddress ? (
                  <textarea 
                    value={addressInput} 
                    onChange={e => setAddressInput(e.target.value)} 
                    className="mt-2 w-full min-h-[100px] p-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004d33] resize-y" 
                    placeholder="Masukkan alamat lengkap..."
                  />
                ) : (
                  <p className="font-medium text-gray-900 mt-1 leading-relaxed max-w-md">{profile.address || '-'}</p>
                )}
              </div>
              <div className="pt-2">
                {isEditingAddress ? (
                  <Button onClick={() => handleUpdate('address')} size="sm" className="bg-[#004d33] text-white hover:bg-[#003322]">Simpan</Button>
                ) : (
                  <Button size="sm" onClick={() => setIsEditingAddress(true)} className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-5 text-xs h-8">Ubah</Button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-8">
            <Button 
              onClick={() => { Cookies.remove('token'); router.push('/auth/login'); }}
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 h-10 rounded-lg"
            >
              Keluar Akun
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}