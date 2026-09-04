import { redirect } from "next/navigation";

export default function Home() {
  // Otomatis mengarahkan pengunjung dari localhost:3000 ke localhost:3000/auth/login
  redirect("/auth/login");
}
