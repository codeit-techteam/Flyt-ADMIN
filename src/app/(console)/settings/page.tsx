"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { env } from "@/config/env";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";

export default function SettingsPage() {
  const { push } = useToast();
  const [supportEmail, setSupportEmail] = useState("support@flyt.app");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  return (
    <div>
      <PageHeader title="Settings" description="Platform configuration and integration status." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="General" />
          <CardBody className="space-y-3">
            <Input label="Support email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
            <Input label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            <Button
              onClick={() =>
                push("Settings saved locally. Persist via backend before production use.", "success")
              }
            >
              Save changes
            </Button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Integrations" />
          <CardBody className="space-y-3 text-sm">
            <Row label="API base URL" value={env.apiBaseUrl || "Not configured"} status={env.hasBackend ? "connected" : "missing"} />
            <Row label="Demo mode" value={env.demoMode ? "Enabled" : "Disabled"} status={env.demoMode ? "demo" : "live"} />
            <Row label="Auth provider" value="Frontend localStorage session" status="placeholder" />
            <Row label="Payments gateway" value="Not connected" status="missing" />
            <Row label="Maps / live tracking" value="Not connected" status="missing" />
            <Row label="Push notifications" value="Not connected" status="missing" />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "connected" | "missing" | "demo" | "placeholder" | "live";
}) {
  const tone =
    status === "connected" || status === "live"
      ? "success"
      : status === "demo" || status === "placeholder"
        ? "warning"
        : "danger";
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-ground px-3 py-2">
      <div>
        <p className="font-medium text-ink">{label}</p>
        <p className="text-xs text-muted">{value}</p>
      </div>
      <Badge tone={tone}>{status}</Badge>
    </div>
  );
}
