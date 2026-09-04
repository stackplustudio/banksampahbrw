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
    // Perbaikan endpoint dari /users/me menjadi /nasabah/profile
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

  if (!profile) return <div className="p-8 text-center text-gray-500">Memuat Profil...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6"> {/* Perbaikan Layout */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-gray-500 text-sm">Kelola informasi pribadi Anda</p>
      </div>

      <div className="flex gap-10 bg-white p-8 rounded-xl border border-gray-100 shadow-sm items-start">
        <div className="flex flex-col items-center border-r pr-10">
          <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden mb-4 border-4 border-white shadow">
            <div className="w-full h-full bg-blue-100 flex items-center justify-center text-4xl text-blue-500 font-bold">
              {profile.name.substring(0,1)}
            </div>
          </div>
          <h3 className="font-bold text-lg text-gray-900">{profile.name}</h3>
          <p className="text-sm text-gray-500">{profile.nasabahId}</p>
        </div>

        <div className="flex-1 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Informasi Pribadi</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500">ID Nasabah</label>
              <p className="font-medium text-gray-900">{profile.nasabahId}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Nama Lengkap</label>
              <p className="font-medium text-gray-900">{profile.name}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Alamat Email</label>
              <p className="font-medium text-gray-900">{profile.email}</p>
            </div>
            
            <div className="flex justify-between items-end border-b pb-4">
              <div className="flex-1 mr-4">
                <label className="text-xs text-gray-500">Nomor Telepon</label>
                {isEditingPhone ? (
                  <Input value={phoneInput} onChange={e => setPhoneInput(e.target.value)} className="mt-1 h-8" />
                ) : (
                  <p className="font-medium text-gray-900">{profile.phone || '-'}</p>
                )}
              </div>
              {isEditingPhone ? (
                <Button onClick={() => handleUpdate('phone')} size="sm" className="bg-[#004d33] text-white">Simpan</Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditingPhone(true)} className="bg-[#004d33] text-white hover:bg-[#006644] border-none">Ubah</Button>
              )}
            </div>

            <div className="flex justify-between items-end pb-2">
              <div className="flex-1 mr-4">
                <label className="text-xs text-gray-500">Alamat Tempat Tinggal</label>
                {isEditingAddress ? (
                  <Input value={addressInput} onChange={e => setAddressInput(e.target.value)} className="mt-1 h-8" />
                ) : (
                  <p className="font-medium text-gray-900">{profile.address || '-'}</p>
                )}
              </div>
              {isEditingAddress ? (
                <Button onClick={() => handleUpdate('address')} size="sm" className="bg-[#004d33] text-white">Simpan</Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditingAddress(true)} className="bg-[#004d33] text-white hover:bg-[#006644] border-none">Ubah</Button>
              )}
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={() => { Cookies.remove('token'); router.push('/auth/login'); }}
              className="bg-red-600 hover:bg-red-700 text-white w-32"
            >
              Keluar Akun
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}