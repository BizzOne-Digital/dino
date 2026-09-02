"use client";

import { useEffect, useState } from "react";
import {
  AdminButton,
  AdminCard,
  AdminPageHeader,
  EmptyState,
  LoadingState,
} from "@/components/admin/admin-ui";

interface AuditLog {
  _id: string;
  adminEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/audit-logs?page=${page}`)
      .then((r) => r.json())
      .then((d) => {
        setLogs(d.logs || []);
        setPages(d.pages || 1);
        setLoading(false);
      });
  }, [page]);

  return (
    <div>
      <AdminPageHeader title="Audit Logs" description="Track admin actions" />

      <AdminCard>
        {loading ? (
          <LoadingState />
        ) : logs.length === 0 ? (
          <EmptyState message="No audit logs yet" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Admin</th>
                    <th className="pb-3 font-medium">Action</th>
                    <th className="pb-3 font-medium">Entity</th>
                    <th className="pb-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 text-gray-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="py-3">{log.adminEmail}</td>
                      <td className="py-3 capitalize">{log.action}</td>
                      <td className="py-3 capitalize">{log.entity}{log.entityId && <span className="text-gray-400 text-xs ml-1">#{log.entityId.slice(-6)}</span>}</td>
                      <td className="py-3 text-gray-500">{log.details || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <AdminButton variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</AdminButton>
                <span className="text-sm text-gray-500">Page {page} of {pages}</span>
                <AdminButton variant="secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</AdminButton>
              </div>
            )}
          </>
        )}
      </AdminCard>
    </div>
  );
}
