"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteQuizBtn({ quizId, quizTitle }: { quizId: string; quizTitle: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete quiz "${quizTitle}" and all its sessions? This cannot be undone.`)) return;
    setBusy(true);
    await fetch(`/api/liveq/admin/quizzes/${quizId}`, { method: "DELETE" });
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
