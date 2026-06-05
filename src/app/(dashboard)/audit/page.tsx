import { getAuditLogs } from "@/app/actions/audit";
import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function AuditLogsPage() {
  const { data: logs, success } = await getAuditLogs();

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
          Audit Logs
        </h1>
        <p className="text-gray-500 text-sm mt-1">System-wide trail of important events</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Entity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Details</th>
                </tr>
              </thead>
              <tbody>
                {!success || !logs || logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.action.includes('SALE') ? 'bg-green-100 text-green-700' :
                          log.action.includes('PURCHASE') ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 capitalize">
                        {log.entityType} ({log.entityId.slice(0, 8)}...)
                      </td>
                      <td className="py-3 px-4 text-gray-500 font-mono text-[11px] max-w-xs truncate" title={log.details}>
                        {log.details || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
