import { Users } from "lucide-react";
import { getSuppliers } from "@/app/actions/suppliers";
import { SuppliersClient } from "./client-page";

export const metadata = {
  title: "Suppliers - PharmaCare",
};

export default async function SuppliersPage() {
  const { data: initialSuppliers = [] } = await getSuppliers();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
          Suppliers
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage distributors and wholesalers</p>
      </div>
      <SuppliersClient initialSuppliers={initialSuppliers || []} />
    </div>
  );
}
