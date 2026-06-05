import { Download, Database, HardDrive, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function BackupPage() {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Download className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
          Backup & Export
        </h1>
        <p className="text-gray-500 text-sm mt-1">Safeguard your data with manual backups</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-brand-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-brand-600" />
              Export to CSV
            </CardTitle>
            <CardDescription>
              Download your business data in standard CSV format for use in Excel, accounting software, or other analytics tools.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Products Master</p>
                  <p className="text-[11px] text-gray-500">All products and categories</p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="gap-2">
                <a href="/api/backup?type=products" download>
                  <Download className="w-3.5 h-3.5" /> Export
                </a>
              </Button>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Inventory Batches</p>
                  <p className="text-[11px] text-gray-500">Current stock, locations & expiry</p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="gap-2">
                <a href="/api/backup?type=batches" download>
                  <Download className="w-3.5 h-3.5" /> Export
                </a>
              </Button>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Sales History</p>
                  <p className="text-[11px] text-gray-500">All invoices and customer details</p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="gap-2">
                <a href="/api/backup?type=sales" download>
                  <Download className="w-3.5 h-3.5" /> Export
                </a>
              </Button>
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Security Tips
            </CardTitle>
            <CardDescription>
              Best practices for keeping your pharmacy data safe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <ul className="list-disc pl-5 space-y-2">
              <li>Store your backup files in a secure, encrypted flash drive or cloud storage.</li>
              <li>Take backups at the end of every business day.</li>
              <li>Keep multiple versions of backups in case you need to revert to an older state.</li>
              <li>Do not share your backup file publicly, as it contains sensitive business and customer information.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
