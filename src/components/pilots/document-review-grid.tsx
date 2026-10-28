import { Badge } from "@/components/ui/badge";
import {
  documentStatusLabel,
  documentStatusTone,
  pilotDocumentLabel,
} from "@/config/pilot-documents";
import { formatDate, formatRelative } from "@/lib/format";
import type { PilotDocumentRecord, PilotIdentitySelfie } from "@/types";
import { FileText, ScanFace } from "lucide-react";

export function DocumentReviewGrid({
  documents,
  selfie,
  includeSelfie = true,
}: {
  documents: PilotDocumentRecord[];
  selfie?: PilotIdentitySelfie;
  includeSelfie?: boolean;
}) {
  const incomplete = documents.filter(
    (d) => d.status === "missing" || d.status === "rejected" || d.status === "expired",
  ).length;
  const selfieIssue =
    includeSelfie && selfie
      ? selfie.status === "missing" || selfie.status === "rejected"
      : false;
  const attention = incomplete + (selfieIssue ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {attention === 0 ? (
          <p className="text-success">All required documents present.</p>
        ) : (
          <p className="text-warning">
            {attention} item{attention === 1 ? "" : "s"} need attention.
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {documents.map((doc) => (
          <article
            key={doc.type}
            className="flex flex-col rounded-xl border border-border bg-ground/60 p-3 transition hover:border-flyt-purple/20"
          >
            <div className="mb-3 flex h-28 items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface">
              <div className="flex flex-col items-center gap-1.5 text-muted">
                <FileText className="h-7 w-7 opacity-50" strokeWidth={1.5} />
                <span className="max-w-[90%] truncate px-2 text-center text-[10px]">
                  {doc.fileName ?? "No file"}
                </span>
              </div>
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{pilotDocumentLabel(doc.type)}</p>
                {doc.uploadedAt ? (
                  <p className="mt-0.5 text-[11px] text-muted">
                    Uploaded {formatRelative(doc.uploadedAt)}
                  </p>
                ) : null}
                {doc.expiryDate ? (
                  <p className="mt-0.5 text-[11px] text-muted">Expires {formatDate(doc.expiryDate)}</p>
                ) : null}
              </div>
              <Badge tone={documentStatusTone(doc.status)}>{documentStatusLabel[doc.status]}</Badge>
            </div>
            {doc.rejectionReason ? (
              <p className="mt-2 rounded-md bg-danger-soft px-2 py-1.5 text-xs text-danger">
                {doc.rejectionReason}
              </p>
            ) : null}
          </article>
        ))}

        {includeSelfie && selfie ? (
          <article className="flex flex-col rounded-xl border border-border bg-ground/60 p-3 transition hover:border-flyt-purple/20">
            <div className="mb-3 flex h-28 items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface">
              <div className="flex flex-col items-center gap-1.5 text-muted">
                <ScanFace className="h-7 w-7 opacity-50" strokeWidth={1.5} />
                <span className="text-[10px]">{selfie.previewLabel ?? "Live selfie"}</span>
              </div>
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">Live identity selfie</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  Front-camera capture from Pilot onboarding — not gallery avatar.
                </p>
                {selfie.uploadedAt ? (
                  <p className="mt-0.5 text-[11px] text-muted">
                    Captured {formatRelative(selfie.uploadedAt)}
                  </p>
                ) : null}
              </div>
              <Badge
                tone={
                  selfie.status === "uploaded"
                    ? "success"
                    : selfie.status === "under_review"
                      ? "info"
                      : selfie.status === "rejected" || selfie.status === "missing"
                        ? "danger"
                        : "neutral"
                }
              >
                {selfie.status.replace(/_/g, " ")}
              </Badge>
            </div>
            {selfie.rejectionReason ? (
              <p className="mt-2 rounded-md bg-danger-soft px-2 py-1.5 text-xs text-danger">
                {selfie.rejectionReason}
              </p>
            ) : null}
          </article>
        ) : null}
      </div>
    </div>
  );
}
