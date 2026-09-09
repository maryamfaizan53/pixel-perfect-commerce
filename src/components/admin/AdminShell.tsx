import { ReactNode } from "react";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { AdminLayout } from "@/components/admin/AdminLayout";

/** Gate + chrome for every /admin/* page. */
export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <RequireAdmin>
      <AdminLayout>{children}</AdminLayout>
    </RequireAdmin>
  );
}
