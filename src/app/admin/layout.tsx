import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-0 min-h-screen bg-ivory">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8 overflow-x-auto">{children}</div>
    </div>
  );
}
