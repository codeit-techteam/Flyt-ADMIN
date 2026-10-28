"use client";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatRelative } from "@/lib/format";
import { listAdmins } from "@/services/data";
import type { AdminUser } from "@/types";
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const { push } = useToast();
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminUser["role"]>("viewer");

  useEffect(() => {
    listAdmins().then(setRows);
  }, []);

  const columns: Column<AdminUser>[] = [
    { key: "name", header: "Name", render: (u) => u.name },
    { key: "email", header: "Email", render: (u) => u.email },
    {
      key: "role",
      header: "Role",
      render: (u) => <Badge tone="brand">{u.role.replaceAll("_", " ")}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <Badge tone={u.status === "active" ? "success" : u.status === "invited" ? "info" : "neutral"}>
          {u.status}
        </Badge>
      ),
    },
    {
      key: "active",
      header: "Last active",
      render: (u) => (u.lastActiveAt ? formatRelative(u.lastActiveAt) : "—"),
    },
  ];

  function invite() {
    if (!name.trim() || !email.trim()) {
      push("Name and email are required.", "error");
      return;
    }
    setRows((prev) => [
      {
        id: `AD-${String(prev.length + 1).padStart(2, "0")}`,
        name: name.trim(),
        email: email.trim(),
        role,
        status: "invited",
        lastActiveAt: null,
      },
      ...prev,
    ]);
    setOpen(false);
    setName("");
    setEmail("");
    push("Invite saved locally. Email delivery is not connected.", "info");
  }

  return (
    <div>
      <PageHeader
        title="Admin Users & Roles"
        description="Manage console access. Permissions must be enforced by the backend."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            Invite admin
          </Button>
        }
      />
      <Card>
        <DataTable columns={columns} rows={rows} />
      </Card>
      <Dialog open={open} onClose={() => setOpen(false)} title="Invite administrator">
        <div className="space-y-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as AdminUser["role"])}
          >
            <option value="super_admin">Super admin</option>
            <option value="ops_manager">Ops manager</option>
            <option value="support">Support</option>
            <option value="finance">Finance</option>
            <option value="viewer">Viewer</option>
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={invite}>Send invite</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
