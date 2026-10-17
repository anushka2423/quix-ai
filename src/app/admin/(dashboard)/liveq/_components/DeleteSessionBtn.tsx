"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteSessionBtn({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this session and all participant data? This cannot be undone.")) return;
    setBusy(true);
    await fetch(`/api/liveq/admin/sessions/${sessionId}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      style={{
        background: "none", border: "none", color: "var(--incorrect-text)",
        fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500, padding: 0,
      }}
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
