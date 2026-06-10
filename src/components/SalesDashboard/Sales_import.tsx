import { useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import { useUserData } from "./Sales_Hook/User_Data";

export interface LeadPayload {
  leadName: string;
  owner?: string;
  status: string;
  indications?: string;
  companyName?: string;
  leadScore: number;
  email?: string;
  phone?: string;
  title?: string;
  specificRole?: string;
  region?: string;
  profileUrl?: string;
  linkedin?: string;
  leadCreatedBy?: string;
  proposalSent?: boolean;
  ServiceNeed?: string;
  assignedToMarketer: string;
  source?: string;
}

interface SmartLeadImporterProps {
  onSave: (leads: LeadPayload[]) => void | Promise<void>;
  defaults?: Partial<LeadPayload>;
  isLoading?: boolean;
}

const VALID_SERVICE_NEEDS = ["Graphic", "Web", "Software", "Marketing", "SEO"];

const CRM_FIELDS: { key: keyof LeadPayload | "__skip__"; label: string; required?: boolean }[] = [
  { key: "leadName",           label: "Lead Name",         required: true },
  { key: "email",              label: "Email" },
  { key: "phone",              label: "Phone" },
  { key: "companyName",        label: "Company Name" },
  { key: "status",             label: "Status",            required: true },
  { key: "leadScore",          label: "Lead Score" },
  { key: "title",              label: "Job Title" },
  { key: "region",             label: "Region" },
  { key: "source",             label: "Source" },
  { key: "owner",              label: "Owner" },
  { key: "assignedToMarketer", label: "Assigned Marketer", required: true },
  { key: "linkedin",           label: "LinkedIn URL" },
  { key: "profileUrl",         label: "Profile URL" },
  { key: "indications",        label: "Indications" },
  { key: "specificRole",       label: "Specific Role" },
  { key: "ServiceNeed",        label: "Service Need" },
  { key: "__skip__",           label: "— Skip this column —" },
];

// ── FIX: "lead" বাদ দিলাম — "Lead Score" যেন leadName এ না যায় ──
// ── exact match আগে, তারপর partial — এই order টা autoDetectField এ enforce করা হয়েছে ──
const ALIAS_MAP: Record<string, string[]> = {
  leadName:           ["lead name", "full name", "contact name", "name", "person", "prospect", "contact"],
  email:              ["email address", "e-mail", "email", "mail"],
  phone:              ["contact no", "telephone", "mobile", "phone", "cell", "tel", "ph"],
  companyName:        ["company name", "organization", "company", "account", "firm", "org"],
  status:             ["lead stage", "pipeline stage", "status", "stage", "state"],
  leadScore:          ["lead score", "score", "rating", "points", "rank"],
  title:              ["job title", "designation", "position", "title"],
  region:             ["territory", "location", "country", "region", "area", "city"],
  source:             ["lead source", "channel", "source", "origin"],
  owner:              ["account owner", "sales rep", "assigned to", "owner", "rep"],
  assignedToMarketer: ["assigned marketer", "marketing rep", "marketer"],
  linkedin:           ["linkedin url", "linkedin profile", "linkedin", "li"],
  profileUrl:         ["profile url", "profile", "website", "url", "link"],
  indications:        ["indications", "indication", "remarks", "notes", "note"],
  specificRole:       ["specific role", "specific", "sub role"],
  ServiceNeed:        ["service need", "service required", "service", "need"],
};

function autoDetectField(header: string): keyof LeadPayload | "__skip__" {
  const norm = header.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  if (norm === "leadcreatedby" || norm.includes("leadcreatedby")) return "__skip__";

  // exact match আগে চেক করি
  for (const [field, aliases] of Object.entries(ALIAS_MAP)) {
    if (aliases.some((a) => norm === a)) return field as keyof LeadPayload;
  }
  // তারপর partial match — longer alias আগে চেক (more specific first)
  for (const [field, aliases] of Object.entries(ALIAS_MAP)) {
    const sorted = [...aliases].sort((a, b) => b.length - a.length);
    if (sorted.some((a) => norm.includes(a))) return field as keyof LeadPayload;
  }
  return "__skip__";
}

function buildLeads(
  headers: string[],
  rows: string[][],
  mapping: Record<string, keyof LeadPayload | "__skip__">,
  defaults: Partial<LeadPayload>
): LeadPayload[] {
  // FIX: defaults থেকে required fields আলাদা করি — ...defaults spread এ override না হয় 
  const {
    leadName: defaultLeadName,
    status: defaultStatus,
    leadScore: defaultLeadScore,
    assignedToMarketer: defaultMarketer,
    ServiceNeed: defaultServiceNeed,
    ...restDefaults
  } = defaults;

  return rows
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row) => {
      const raw: Record<string, string> = {};
      headers.forEach((h, i) => {
        const field = mapping[h];
        if (field && field !== "__skip__") raw[field] = String(row[i] ?? "").trim();
      });

      return {
        leadName:           raw.leadName            || defaultLeadName || "Unknown",
        status:             raw.status              || defaultStatus   || "New Lead",
        leadScore:          parseInt(raw.leadScore  || "0", 10) || defaultLeadScore || 0,
        assignedToMarketer: raw.assignedToMarketer  || defaultMarketer || "",
        email:              raw.email               || undefined,
        phone:              raw.phone               || undefined,
        companyName:        raw.companyName         || undefined,
        title:              raw.title               || undefined,
        region:             raw.region              || undefined,
        source:             raw.source              || undefined,
        owner:              raw.owner               || undefined,
        linkedin:           raw.linkedin            || undefined,
        profileUrl:         raw.profileUrl          || undefined,
        indications:        raw.indications         || undefined,
        specificRole:       raw.specificRole        || undefined,
        ServiceNeed:        VALID_SERVICE_NEEDS.includes(raw.ServiceNeed ?? "")
                              ? raw.ServiceNeed
                              : defaultServiceNeed ?? "Graphic",
        ...restDefaults, // শুধু বাকি optional extras
      } as LeadPayload;
    });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepBadge({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <span style={{
      width: 26, height: 26, borderRadius: "50%", display: "inline-flex",
      alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600,
      flexShrink: 0,
      background: done ? "#111" : active ? "#000" : "#f1f5f9",
      color: done || active ? "#fff" : "#94a3b8",
      transition: "all 0.2s",
      boxShadow: active ? "0 0 0 3px #e2e8f0" : "none",
    }}>
      {done ? "✓" : n}
    </span>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "green" | "yellow" | "blue" | "default" }) {
  const colors = {
    green:   { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
    yellow:  { background: "#fefce8", color: "#854d0e", border: "1px solid #fde68a" },
    blue:    { background: "#f8fafc", color: "#334155", border: "1px solid #e2e8f0" },
    default: { background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" },
  };
  return (
    <span style={{ ...colors[variant], borderRadius: 6, fontSize: 11, fontWeight: 500, padding: "3px 10px", display: "inline-flex", alignItems: "center", gap: 4 }}>
      {children}
    </span>
  );
}

type Step = 1 | 2 | 3;

export default function Sales_import({ onSave, defaults = {}, isLoading = false }: SmartLeadImporterProps) {
  const { userData } = useUserData();
  const [step, setStep]               = useState<Step>(1);
  const [headers, setHeaders]         = useState<string[]>([]);
  const [rows, setRows]               = useState<string[][]>([]);
  const [sheets, setSheets]           = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [workbook, setWorkbook]       = useState<XLSX.WorkBook | null>(null);
  const [mapping, setMapping]         = useState<Record<string, keyof LeadPayload | "__skip__">>({});
  const [mappedLeads, setMappedLeads] = useState<LeadPayload[]>([]);
  const [error, setError]             = useState<string | null>(null);
  const [fileName, setFileName]       = useState("");
  const [dragging, setDragging]       = useState(false);
  const [previewPage, setPreviewPage] = useState(0);
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  const PAGE_SIZE = 8;

  const parseSheet = useCallback((wb: XLSX.WorkBook, sheetName: string) => {
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as string[][];
    const nonEmpty = data.filter((r) => r.some((c) => String(c).trim() !== ""));
    if (nonEmpty.length < 2) { setError("Sheet এ পর্যাপ্ত data নেই।"); return; }
    const hdrs = nonEmpty[0].map((h) => String(h).trim());
    const dataRows = nonEmpty.slice(1).map((r) => hdrs.map((_, i) => String(r[i] ?? "").trim()));
    setHeaders(hdrs);
    setRows(dataRows);
    const autoMap: Record<string, keyof LeadPayload | "__skip__"> = {};
    hdrs.forEach((h) => { autoMap[h] = autoDetectField(h); });
    setMapping(autoMap);
    setError(null);
    setStep(2);
  }, []);

  const handleFile = useCallback((file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext || "")) {
      setError("Only .xlsx, .xls, or .csv files are supported.");
      return;
    }
    setFileName(file.name);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        setWorkbook(wb);
        if (wb.SheetNames.length > 1) {
          setSheets(wb.SheetNames);
          setActiveSheet(wb.SheetNames[0]);
          parseSheet(wb, wb.SheetNames[0]);
        } else {
          setSheets([]);
          parseSheet(wb, wb.SheetNames[0]);
        }
      } catch {
        setError("Failed to read file. Please provide a valid Excel or CSV file.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, [parseSheet]);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handlePreview = () => {
    const leads = buildLeads(headers, rows, mapping, defaults);
    setMappedLeads(leads);
    setPreviewPage(0);
    setStep(3);
  };

  const handleSubmit = async () => {
    const leadsWithCreator = mappedLeads.map((lead) => ({
      ...lead,
      leadCreatedBy: lead.leadCreatedBy || userData?._id || "",
      assignedToMarketer: lead.assignedToMarketer || userData?._id || userData?.name || "Unassigned",
    }));
    console.log("Importing leads:", leadsWithCreator);
    try {
      await onSave(leadsWithCreator);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lead import failed. Please try again.");
    }
  };

  const reset = () => {
    setStep(1); setHeaders([]); setRows([]); setSheets([]);
    setActiveSheet(""); setWorkbook(null); setMapping({});
    setMappedLeads([]); setError(null); setFileName(""); setPreviewPage(0);
  };

  const visibleFields = CRM_FIELDS.filter(
    (f) => f.key !== "__skip__" && Object.values(mapping).includes(f.key as keyof LeadPayload)
  );

  const totalPages = Math.ceil(mappedLeads.length / PAGE_SIZE);
  const pagedLeads = mappedLeads.slice(previewPage * PAGE_SIZE, (previewPage + 1) * PAGE_SIZE);
  const unknownCount = mappedLeads.filter((l) => l.leadName === "Unknown").length;

  // ── Black & White style system ─────────────────────────────────────────────
  const S = {
    card: {
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      padding: "1.5rem",
      marginBottom: "1rem",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    } as React.CSSProperties,
    input: {
      width: "100%", boxSizing: "border-box" as const,
      border: "1px solid #d1d5db", borderRadius: 7,
      padding: "7px 10px", fontSize: 13,
      background: "#fff", color: "#111827",
      outline: "none",
    } as React.CSSProperties,
    btnPrimary: {
      background: "#111827", color: "#fff", border: "none",
      borderRadius: 8, padding: "9px 20px", fontSize: 13,
      fontWeight: 600, cursor: "pointer",
      display: "inline-flex", alignItems: "center", gap: 6,
    } as React.CSSProperties,
    btnSecondary: {
      background: "#fff", border: "1px solid #d1d5db",
      borderRadius: 8, padding: "9px 18px", fontSize: 13,
      cursor: "pointer", color: "#374151", fontWeight: 500,
    } as React.CSSProperties,
    btnGhost: {
      background: "transparent", border: "none",
      padding: "5px 10px", fontSize: 12,
      cursor: "pointer", color: "#9ca3af", borderRadius: 6,
    } as React.CSSProperties,
    colLabel: {
      background: "#f9fafb", border: "1px solid #e5e7eb",
      borderRadius: 6, padding: "6px 10px",
      fontSize: 12, fontWeight: 500, color: "#374151",
      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
    } as React.CSSProperties,
    label: { fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase" as const },
    muted: { fontSize: 12, color: "#9ca3af" },
    sectionTitle: { margin: "0 0 4px", fontWeight: 700, fontSize: 15, color: "#111827" },
    sectionSub: { margin: "0 0 16px", fontSize: 13, color: "#6b7280" },
  };

  return (
    <div style={{ maxWidth: 700, width: "100%", margin: "0 auto", fontFamily: "inherit", fontSize: 14, color: "#111827" }}>

      {/* Step bar */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: "1.75rem" }}>
        {(["Upload", "Mapping", "Preview"] as const).map((label, idx) => {
          const n = (idx + 1) as 1 | 2 | 3;
          return (
            <span key={n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <StepBadge n={n} active={step === n} done={step > n} />
              <span style={{ fontSize: 12, fontWeight: step === n ? 700 : 400, color: step === n ? "#111827" : "#9ca3af" }}>
                {label}
              </span>
              {n < 3 && <span style={{ color: "#e5e7eb", margin: "0 2px", fontSize: 12 }}>──</span>}
            </span>
          );
        })}
        {fileName && step > 1 && (
          <span style={{ marginLeft: "auto", ...S.muted, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, padding: "3px 10px", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            📄 {fileName}
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#b91c1c", display: "flex", alignItems: "center", gap: 8 }}>
          ⚠ {error}
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 1 && (
        <div style={S.card}>
          <p style={S.sectionTitle}>Upload Excel / CSV file</p>
          {/* <p style={S.sectionSub}>.xlsx, .xls, or .csv — drag & drop or click to upload</p> */}

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            style={{
              border: `2px dashed ${dragging ? "#111827" : "#d1d5db"}`,
              borderRadius: 10, padding: "3rem 1rem", textAlign: "center",
              cursor: "pointer", transition: "all 0.2s",
              background: dragging ? "#f9fafb" : "#fafafa",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>{dragging ? "⬇️" : "📂"}</div>
            {fileName ? (
              <>
                <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#111827", fontSize: 14 }}>{fileName}</p>
                <p style={S.muted}>parsing...</p>
              </>
            ) : (
              <>
                <p style={{ margin: "0 0 6px", fontWeight: 500, fontSize: 14, color: "#111827" }}>Drag a file here or click to browse</p>
                <p style={S.muted}>.xlsx · .xls · .csv supported</p>
              </>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={onFileInput} style={{ display: "none" }} />
        </div>
      )}

      {/* Step 2: Mapping */}
      {step === 2 && (
        <div style={S.card}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <p style={S.sectionTitle}>Confirm field mapping</p>
              <p style={{ ...S.sectionSub, marginBottom: 0 }}>AI auto-detected — change if needed</p>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 12 }}>
              <Badge variant="blue">{rows.length} rows</Badge>
              <Badge>{headers.length} cols</Badge>
            </div>
          </div>

          {sheets.length > 1 && (
            <div style={{ marginBottom: 16, padding: "10px 12px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
              <p style={{ ...S.muted, marginBottom: 8, fontWeight: 500 }}>Select sheet:</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {sheets.map((s) => (
                  <button key={s} onClick={() => { setActiveSheet(s); if (workbook) parseSheet(workbook, s); }}
                    style={{ ...S.btnSecondary, padding: "5px 12px", fontSize: 12,
                      background: activeSheet === s ? "#111827" : "#fff",
                      borderColor: activeSheet === s ? "#111827" : "#d1d5db",
                      color: activeSheet === s ? "#fff" : "#374151",
                      fontWeight: activeSheet === s ? 600 : 400,
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 22px 1fr", gap: "5px 8px", alignItems: "center" }}>
            <span style={S.label}>Sheet column</span>
            <span />
            <span style={S.label}>CRM field</span>

            {headers.map((h) => (
              <>
                <div key={`l-${h}`} title={h} style={S.colLabel}>{h}</div>
                <div key={`a-${h}`} style={{ textAlign: "center", color: "#d1d5db", fontSize: 16, userSelect: "none" }}>→</div>
                <select key={`s-${h}`}
                  value={mapping[h] ?? "__skip__"}
                  onChange={(e) => setMapping((m) => ({ ...m, [h]: e.target.value as keyof LeadPayload | "__skip__" }))}
                  style={{ ...S.input,
                    borderColor: mapping[h] && mapping[h] !== "__skip__" ? "#111827" : "#d1d5db",
                    fontWeight: mapping[h] && mapping[h] !== "__skip__" ? 500 : 400,
                  }}>
                  {CRM_FIELDS.map((f) => (
                    <option key={f.key as string} value={f.key as string}>
                      {f.label}{f.required ? " *" : ""}
                    </option>
                  ))}
                </select>
              </>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <button style={S.btnPrimary} onClick={handlePreview}>View Preview →</button>
            <button style={S.btnSecondary} onClick={reset}>← New File</button>
          </div>
        </div>
      )}

      {/* Step 3: Preview + Submit */}
      {step === 3 && (
        <div style={S.card}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <p style={S.sectionTitle}>Preview & Submit</p>
              <p style={{ ...S.sectionSub, marginBottom: 0 }}>The data below will be imported — please confirm</p>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Badge variant="green">✓ {mappedLeads.length} leads</Badge>
              {unknownCount > 0 && <Badge variant="yellow">⚠ {unknownCount} name missing</Badge>}
            </div>
          </div>

          <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "9px 12px", textAlign: "left", fontWeight: 600, color: "#9ca3af", borderBottom: "1px solid #e5e7eb", fontSize: 11, width: 36 }}>#</th>
                  {visibleFields.map((f) => (
                    <th key={f.key as string} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 600, color: "#9ca3af", borderBottom: "1px solid #e5e7eb", fontSize: 11, whiteSpace: "nowrap" }}>
                      {f.label.toUpperCase()}{f.required ? " *" : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedLeads.map((lead, i) => {
                  const globalIdx = previewPage * PAGE_SIZE + i;
                  const isUnknown = lead.leadName === "Unknown";
                  return (
                    <tr key={globalIdx}
                      style={{
                        borderBottom: i < pagedLeads.length - 1 ? "1px solid #f3f4f6" : "none",
                        background: isUnknown ? "#fffbeb" : "#fff",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = isUnknown ? "#fef9c3" : "#f9fafb")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = isUnknown ? "#fffbeb" : "#fff")}
                    >
                      <td style={{ padding: "8px 12px", color: "#d1d5db", fontSize: 11, fontWeight: 500 }}>
                        {globalIdx + 1}
                      </td>
                      {visibleFields.map((f) => {
                        const val = lead[f.key as keyof LeadPayload];
                        const isEmpty = val == null || val === "";
                        return (
                          <td key={f.key as string} style={{
                            padding: "8px 12px",
                            color: isEmpty ? "#d1d5db" : f.key === "leadName" ? "#111827" : "#374151",
                            fontWeight: f.key === "leadName" ? 600 : 400,
                            maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {isEmpty ? "—" : String(val)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={S.muted}>
                {previewPage * PAGE_SIZE + 1}–{Math.min((previewPage + 1) * PAGE_SIZE, mappedLeads.length)} / {mappedLeads.length} rows
              </span>
              <div style={{ display: "flex", gap: 2 }}>
                <button style={{ ...S.btnGhost, opacity: previewPage === 0 ? 0.3 : 1 }}
                  disabled={previewPage === 0} onClick={() => setPreviewPage(p => p - 1)}>← Prev</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg = totalPages <= 5 ? i : Math.max(0, Math.min(previewPage - 2, totalPages - 5)) + i;
                  return (
                    <button key={pg} onClick={() => setPreviewPage(pg)} style={{
                      ...S.btnGhost,
                      fontWeight: previewPage === pg ? 700 : 400,
                      color: previewPage === pg ? "#111827" : "#9ca3af",
                      background: previewPage === pg ? "#f3f4f6" : "transparent",
                      border: previewPage === pg ? "1px solid #e5e7eb" : "none",
                    }}>{pg + 1}</button>
                  );
                })}
                <button style={{ ...S.btnGhost, opacity: previewPage >= totalPages - 1 ? 0.3 : 1 }}
                  disabled={previewPage >= totalPages - 1} onClick={() => setPreviewPage(p => p + 1)}>Next →</button>
              </div>
            </div>
          )}

          {/* Action row */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
            <button
              style={{ ...S.btnPrimary, opacity: isLoading ? 0.6 : 1, minWidth: 160, justifyContent: "center" }}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading
                ? <><span style={{ display: "inline-block", width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Saving...</>
                : <>↑ Import {mappedLeads.length} leads</>
              }
            </button>
            <button style={S.btnSecondary} onClick={() => setStep(2)}>← Mapping ঠিক করুন</button>
            <button style={{ ...S.btnGhost, marginLeft: "auto", color: "#6b7280" }} onClick={reset}>Cancel</button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}