"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("refresh_token");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Secure Dashboard</h1>
        <Button onClick={handleLogout} variant="destructive">Logout</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="p-6 bg-white rounded-lg shadow border border-zinc-200">
          <h2 className="text-xl font-semibold mb-2">Manajemen User (CRUD)</h2>
          <p className="text-zinc-500 mb-4">Lihat standar blueprint tabel dan integrasi API NestJS.</p>
          <Link href="/dashboard/users">
            <Button className="w-full">Buka Modul User</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}