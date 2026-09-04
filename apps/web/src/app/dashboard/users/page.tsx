"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import Link from "next/link"; // Tambahkan import Link
import { toast } from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      toast.error("Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus user ${name}?`)) {
      try {
        await api.delete(`/users/${id}`);
        toast.success("User berhasil dihapus!");
        fetchUsers(); 
      } catch (error) {
        toast.error("Gagal menghapus user");
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* BAGIAN HEADER YANG DIUPDATE */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Manajemen User</h1>
            <p className="text-zinc-500">Blueprint CRUD Core Engine</p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Kembali</Button>
            </Link>
            <Link href="/dashboard/users/create">
              <Button>+ Tambah User Baru</Button>
            </Link>
          </div>
        </div>
        {/* ... (SISA KODE TABEL DI BAWAHNYA TETAP SAMA) ... */}
        
        <div className="bg-white rounded-lg shadow border border-zinc-200 overflow-hidden">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-900">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">Memuat data...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">Belum ada data user.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition">
                    <td className="px-6 py-4 font-medium text-zinc-900">{user.name || "-"}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-zinc-900 text-white text-xs rounded-full">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Link href={`/dashboard/users/edit/${user.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(user.id, user.name)}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}