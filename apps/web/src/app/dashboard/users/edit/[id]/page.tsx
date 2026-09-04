"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER"
  });

  useEffect(() => {
    // Tarik data lama untuk mengisi form
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          password: "", // Kosongkan agar tidak terisi hash
          role: res.data.role || "USER"
        });
      } catch (error) {
        toast.error("Gagal mengambil data user");
        router.push("/dashboard/users");
      } finally {
        setFetching(false);
      }
    };
    if (userId) fetchUser();
  }, [userId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.patch(`/users/${userId}`, formData);
      toast.success("Berhasil memperbarui data!");
      router.push("/dashboard/users");
    } catch (error: any) {
      toast.error("Gagal: " + (error.response?.data?.message || "Terjadi kesalahan"));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Edit User</h1>
            <p className="text-zinc-500">Perbarui data anggota</p>
          </div>
          <Button onClick={() => router.back()} variant="outline">Batal</Button>
        </div>

        <div className="bg-white rounded-lg shadow border border-zinc-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Nama Lengkap</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-zinc-900 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-zinc-900 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Password Baru (Opsional)</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-zinc-900 focus:outline-none" placeholder="Isi jika ingin ganti password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Role Akses</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-zinc-900 focus:outline-none bg-white">
                <option value="USER">User Reguler</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            <div className="pt-4 border-t border-zinc-100 flex justify-end">
              <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan Perubahan"}</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}