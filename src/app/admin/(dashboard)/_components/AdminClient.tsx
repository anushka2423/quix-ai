"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DbModule } from "@/lib/admin-supabase";
import {
  createModuleAction,
  updateModuleAction,
  deleteModuleAction,
  seedStaticDataAction,
} from "@/app/admin/actions";

type ModuleForm = { title: string; description: string; locked: boolean };
type SlideMode = "create" | "edit";

const EMPTY_FORM: ModuleForm = { title: "", description: "", locked: false };

export default function AdminClient({
  initialModules,
}: {
  initialModules: DbModule[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [panelOpen, setPanelOpen] = useState(false);
  const [mode, setMode] = useState<SlideMode>("create");
  const [editing, setEditing] = useState<DbModule | null>(null);
  const [form, setForm] = useState<ModuleForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  function openCreate() {
    setForm(EMPTY_FORM);
    setMode("create");
    setEditing(null);
    setFormError(null);
    setPanelOpen(true);
  }

  function openEdit(mod: DbModule) {
    setForm({ title: mod.title, description: mod.description, locked: mod.locked });
    setMode("edit");
    setEditing(mod);
    setFormError(null);
    setPanelOpen(true);
  }

  function handleSave() {
    if (!form.title.trim()) {
      setFormError("Title is required");
      return;
    }
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createModuleAction(form)
          : await updateModuleAction({ id: editing!.id, ...form });
      if (result?.error) {
        setFormError(result.error);
      } else {
        setPanelOpen(false);
        router.refresh();
      }
    });
  }

  function handleSeed() {
    if (
      !window.confirm(
        "Import all existing modules and questions from the app into Supabase?\n\nThis will add them as new rows. Do not run it twice."
      )
    )
      return;
    startTransition(async () => {
      const result = await seedStaticDataAction();
      if (result?.error) {
        setSeedMsg(`Error: ${result.error}`);
      } else {
        setSeedMsg(`Done — ${result.seeded} questions imported.`);
        router.refresh();
      }
    });
  }

  function handleDelete(mod: DbModule) {
    if (!window.confirm(`Delete "${mod.title}" and all its questions? This cannot be undone.`))
      return;
    startTransition(async () => {
      await deleteModuleAction(mod.id);
      router.refresh();
    });
  }

  return (
    <>
      {/* Page header */}
      <div
        style={{
          padding: "28px 32px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--ink)",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Modules
          </h1>
          <p style={{ fontSize: "13px", color: "var(--muted)", margin: "2px 0 0" }}>
            {initialModules.length} module{initialModules.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleSeed}
            disabled={isPending}
            title="Import existing quiz modules and questions into Supabase"
            style={{
              padding: "8px 14px",
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--ink-2)",
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? "Importing…" : "↓ Import existing"}
          </button>
          <button onClick={openCreate} style={primaryBtnStyle}>
            + New Module
          </button>
        </div>
      </div>

      {seedMsg && (
        <div
          style={{
            margin: "12px 32px 0",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            background: seedMsg.startsWith("Error") ? "var(--incorrect-bg)" : "var(--correct-bg)",
            color: seedMsg.startsWith("Error") ? "var(--incorrect-text)" : "var(--correct-text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{seedMsg}</span>
          <button
            onClick={() => setSeedMsg(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", padding: "0 4px", color: "inherit" }}
          >
            ×
          </button>
        </div>
      )}

      {/* Module list */}
      <div
        style={{ padding: "20px 32px 48px", display: "flex", flexDirection: "column", gap: "12px" }}
      >
        {initialModules.length === 0 ? (
          <div
            style={{
              padding: "56px",
              textAlign: "center",
              color: "var(--faint)",
              fontSize: "14px",
              background: "#fff",
              border: "1.5px dashed var(--border)",
              borderRadius: "var(--r-card)",
              marginTop: "8px",
            }}
          >
            No modules yet.{" "}
            <button
              onClick={openCreate}
              style={{
                background: "none",
                border: "none",
                color: "var(--navy)",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                padding: 0,
              }}
            >
              Create the first one →
            </button>
          </div>
        ) : (
          initialModules.map((mod, i) => (
            <div
              key={mod.id}
              style={{
                background: "#fff",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-card)",
                padding: "18px 22px",
                boxShadow: "var(--shadow-card)",
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
              }}
            >
              {/* Order badge */}
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 10px",
                  borderRadius: "var(--r-pill)",
                  background: "var(--navy)",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: "3px",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "var(--ink)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {mod.title}
                  </span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "var(--r-pill)",
                      fontSize: "11px",
                      fontWeight: 600,
                      background: mod.locked ? "var(--canvas)" : "var(--correct-bg)",
                      color: mod.locked ? "var(--faint)" : "var(--correct-text)",
                      border: `1px solid ${mod.locked ? "var(--border)" : "#b7e2cc"}`,
                    }}
                  >
                    {mod.locked ? "Locked" : "Unlocked"}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--muted)",
                    margin: 0,
                    lineHeight: 1.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {mod.description || "No description"}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <Link href={`/admin/modules/${mod.id}`} style={secondaryBtnLinkStyle}>
                  Questions →
                </Link>
                <button onClick={() => openEdit(mod)} style={secondaryBtnStyle}>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(mod)}
                  style={{ ...secondaryBtnStyle, color: "var(--incorrect-text)" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slide-over overlay */}
      {panelOpen && (
        <div
          onClick={() => setPanelOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.4)",
            zIndex: 100,
          }}
        />
      )}

      {/* Slide-over panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "420px",
          background: "#fff",
          zIndex: 101,
          boxShadow: "-4px 0 32px rgba(0,0,0,.14)",
          display: "flex",
          flexDirection: "column",
          transform: panelOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.22s ease",
        }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            {mode === "create" ? "New Module" : "Edit Module"}
          </h2>
          <button
            onClick={() => setPanelOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: "var(--muted)",
              lineHeight: 1,
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>

        {/* Form body */}
        <div
          style={{
            flex: 1,
            padding: "22px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div>
            <label style={fieldLabelStyle}>Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Module title"
              style={fieldInputStyle}
            />
          </div>

          <div>
            <label style={fieldLabelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of what this module covers"
              rows={3}
              style={{ ...fieldInputStyle, resize: "vertical" as const }}
            />
          </div>

          <label
            style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={form.locked}
              onChange={(e) => setForm((f) => ({ ...f, locked: e.target.checked }))}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            <span style={{ fontSize: "13px", color: "var(--ink-2)" }}>
              Lock this module (requires booking to unlock)
            </span>
          </label>

          {formError && (
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "var(--incorrect-text)",
                background: "var(--incorrect-bg)",
                padding: "8px 12px",
                borderRadius: "6px",
              }}
            >
              {formError}
            </p>
          )}
        </div>

        {/* Panel footer */}
        <div
          style={{
            padding: "16px 22px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
          }}
        >
          <button onClick={() => setPanelOpen(false)} style={secondaryBtnStyle}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            style={{
              ...primaryBtnStyle,
              opacity: isPending ? 0.7 : 1,
              cursor: isPending ? "not-allowed" : "pointer",
            }}
          >
            {isPending ? "Saving…" : "Save Module"}
          </button>
        </div>
      </div>
    </>
  );
}

const primaryBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--navy)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  letterSpacing: "-0.01em",
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "6px 14px",
  background: "#fff",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--ink-2)",
  cursor: "pointer",
};

const secondaryBtnLinkStyle: React.CSSProperties = {
  ...secondaryBtnStyle,
  textDecoration: "none",
  display: "inline-block",
};

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "var(--ink-2)",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const fieldInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "14px",
  color: "var(--ink)",
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
};
