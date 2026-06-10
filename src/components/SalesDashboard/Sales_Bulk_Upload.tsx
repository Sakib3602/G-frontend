import { useState, useRef } from "react";
import type { ChangeEvent } from "react";
import * as XLSX from "xlsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, Send, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import useAxiosSales from "@/uri/useAxiosSales";
import { useUserData } from "./Sales_Hook/User_Data";

// ─── Schema & Validation ───────────────────────────────────────────────────

const SERVICE_NEED_ENUM = ["Graphic", "Web", "Marketing"] as const;
const STATUS_OPTIONS = ["New Lead", "Attempted to contact", "Contacted", "In Progress"];
const REGION_OPTIONS = ["US", "ANZ", "EMEA", "APAC", "LATAM", "Global"];

type RawRow = Record<string, unknown>;

export type BulkLeadRow = {
  leadName: string;
  owner: string;
  status: string;
  indications: string;
  companyName: string;
  leadScore: number;
  email: string;
  phone: string;
  title: string;
  specificRole: string;
  region: string;
  profileUrl: string;
  leadCreatedBy: string;
  proposalSent: boolean;
  ServiceNeed: "Graphic" | "Web" | "Marketing";
  assignedToMarketer: string;
};

type ValidationResult =
  | { valid: true; data: BulkLeadRow }
  | { valid: false; errors: string[] };

function validateRow(raw: RawRow, userId: string, userName: string): ValidationResult {
  const errors: string[] = [];

  const str = (key: string, fallback = "") =>
    raw[key] !== undefined && raw[key] !== null ? String(raw[key]).trim() : fallback;
  const num = (key: string, fallback: number) => {
    const v = Number(raw[key]);
    return isNaN(v) ? fallback : v;
  };
  const bool = (key: string, fallback = false) => {
    const v = str(key).toLowerCase();
    if (v === "true" || v === "1" || v === "yes") return true;
    if (v === "false" || v === "0" || v === "no") return false;
    return fallback;
  };

  const leadName = str("leadName");
  if (!leadName) errors.push("leadName is required");

  const email = str("email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("email format invalid");

  const leadScore = num("leadScore", 1);
  if (leadScore < 1 || leadScore > 5) errors.push("leadScore must be 1–5");

  const serviceNeed = str("ServiceNeed", "Graphic") as "Graphic" | "Web" | "Marketing";
  if (!SERVICE_NEED_ENUM.includes(serviceNeed))
    errors.push(`ServiceNeed must be one of: ${SERVICE_NEED_ENUM.join(", ")}`);

  const region = str("region", "US");
  if (region && !REGION_OPTIONS.includes(region))
    errors.push(`region must be one of: ${REGION_OPTIONS.join(", ")}`);

  const status = str("status", "New Lead");
  if (status && !STATUS_OPTIONS.includes(status))
    errors.push(`status must be one of: ${STATUS_OPTIONS.join(", ")}`);

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    data: {
      leadName,
      owner: str("owner", userName),
      status: status || "New Lead",
      indications: str("indications"),
      companyName: str("companyName"),
      leadScore,
      email,
      phone: str("phone"),
      title: str("title"),
      specificRole: str("specificRole"),
      region: region || "US",
      profileUrl: str("profileUrl"),
      leadCreatedBy: str("leadCreatedBy", userId),
      proposalSent: bool("proposalSent"),
      ServiceNeed: serviceNeed,
      assignedToMarketer: str("assignedToMarketer"),
    },
  };
}

// ─── Types for display ─────────────────────────────────────────────────────

type ParsedRow = {
  index: number;
  raw: RawRow;
} & (
  | { valid: true; data: BulkLeadRow }
  | { valid: false; errors: string[] }
);

// ─── Component ─────────────────────────────────────────────────────────────

const Sales_Bulk_Upload = () => {
  const { userData } = useUserData();
  const axiosSales = useAxiosSales();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const validRows = rows.filter((r) => r.valid) as (ParsedRow & { valid: true })[];
  const invalidRows = rows.filter((r) => !r.valid) as (ParsedRow & { valid: false })[];

  // ── Parse XLSX ────────────────────────────────────────────────────────────
  const parseFile = (file: File) => {
    if (
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls") &&
      !file.name.endsWith(".csv")
    ) {
      alert("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    setFileName(file.name);
    setUploadSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: RawRow[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const parsed: ParsedRow[] = json.map((raw, i) => {
        const result = validateRow(raw, userData?._id || "", userData?.name || "Unknown");
        return result.valid
          ? { index: i + 1, raw, valid: true, data: result.data }
          : { index: i + 1, raw, valid: false, errors: result.errors };
      });

      setRows(parsed);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  // ── Mutation ──────────────────────────────────────────────────────────────
  const bulkMutation = useMutation<unknown, Error, BulkLeadRow[]>({
    mutationFn: async (leads) => {
      const res = await axiosSales.post("/api/v1/sales/create-lead", leads );
      return res.data;
    },
    onSuccess: () => {
      setUploadSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["all-sales-leads"] });
      setRows([]);
      setFileName(null);
    },
  });

  const handleBulkSubmit = () => {
    if (validRows.length === 0) return;
    bulkMutation.mutate(validRows.map((r) => r.data));
  };

  const handleClear = () => {
    setRows([]);
    setFileName(null);
    setUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto mb-8">
      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header toggle */}
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#7FA23B]/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-[#7FA23B]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">Bulk Upload via Excel</p>
              <p className="text-xs text-gray-400">Import multiple leads from a .xlsx file</p>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {expanded && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-5 space-y-5">
            {/* Success banner */}
            {uploadSuccess && (
              <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>
                  <strong>{validRows.length || "All"}</strong> leads uploaded successfully!
                </span>
              </div>
            )}

            {/* Drop zone */}
            {!fileName && (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all
                  ${isDragging
                    ? "border-[#7FA23B] bg-[#7FA23B]/5 scale-[1.01]"
                    : "border-gray-200 hover:border-[#7FA23B]/50 hover:bg-gray-50"
                  }`}
              >
                <div className="w-14 h-14 rounded-full bg-[#7FA23B]/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-[#7FA23B]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    Drop your Excel file here, or{" "}
                    <span className="text-[#7FA23B] underline underline-offset-2">browse</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Supports .xlsx and .xls files only</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}

            {/* File loaded state */}
            {fileName && rows.length > 0 && (
              <div className="space-y-4">
                {/* File info + stats bar */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileSpreadsheet className="w-4 h-4 text-[#7FA23B] flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 truncate">{fileName}</span>
                    <span className="text-xs text-gray-400">({rows.length} rows)</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {validRows.length} valid
                    </span>
                    {invalidRows.length > 0 && (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                        <XCircle className="w-3.5 h-3.5" />
                        {invalidRows.length} invalid
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleClear}
                      className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Warning: no valid rows */}
                {validRows.length === 0 && (
                  <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>No valid rows found. Fix the errors below and re-upload.</span>
                  </div>
                )}

                {/* Preview Table */}
                <div className="overflow-auto rounded-lg border border-gray-200 max-h-72">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-500 w-10">#</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-500">Status</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-500">Lead Name</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-500">Email</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-500">Company</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-500">Region</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-500">Service</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-500">Score</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-500 min-w-[180px]">Errors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.map((row) => (
                        <tr
                          key={row.index}
                          className={row.valid ? "bg-white hover:bg-green-50/40" : "bg-red-50/50 hover:bg-red-50"}
                        >
                          <td className="px-3 py-2 text-gray-400">{row.index}</td>
                          <td className="px-3 py-2">
                            {row.valid ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium text-[10px]">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium text-[10px]">
                                <XCircle className="w-2.5 h-2.5" /> Invalid
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 font-medium text-gray-700">
                            {row.valid ? row.data.leadName : String(row.raw.leadName || "—")}
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {row.valid ? row.data.email || "—" : String(row.raw.email || "—")}
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {row.valid ? row.data.companyName || "—" : String(row.raw.companyName || "—")}
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {row.valid ? row.data.region : String(row.raw.region || "—")}
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {row.valid ? row.data.ServiceNeed : String(row.raw.ServiceNeed || "—")}
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {row.valid ? row.data.leadScore : String(row.raw.leadScore || "—")}
                          </td>
                          <td className="px-3 py-2">
                            {!row.valid && (
                              <ul className="space-y-0.5">
                                {row.errors.map((err, i) => (
                                  <li key={i} className="text-red-500 flex items-start gap-1">
                                    <span className="mt-0.5">•</span> {err}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Action */}
                {validRows.length > 0 && (
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-gray-400">
                      Only <strong className="text-gray-600">{validRows.length}</strong> valid row
                      {validRows.length !== 1 ? "s" : ""} will be uploaded.
                      {invalidRows.length > 0 && (
                        <span className="text-red-400 ml-1">
                          {invalidRows.length} row{invalidRows.length !== 1 ? "s" : ""} skipped.
                        </span>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={handleBulkSubmit}
                      disabled={bulkMutation.isPending}
                      className="px-5 py-2 flex items-center gap-2 text-white bg-[#7FA23B] rounded-lg hover:bg-[#6A8831] disabled:opacity-60 disabled:cursor-not-allowed transition-all font-medium text-sm focus:ring-4 focus:ring-[#7FA23B]/30"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {bulkMutation.isPending
                        ? "Uploading…"
                        : `Upload ${validRows.length} Lead${validRows.length !== 1 ? "s" : ""}`}
                    </button>
                  </div>
                )}

                {/* API error */}
                {bulkMutation.isError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    {bulkMutation.error?.message || "Upload failed. Please try again."}
                  </p>
                )}
              </div>
            )}

            {/* Column reference hint */}
            <details className="text-xs text-gray-400 cursor-pointer">
              <summary className="hover:text-gray-600 transition-colors select-none">
                View expected column names
              </summary>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  "leadName*", "email", "phone", "companyName", "region",
                  "title", "specificRole", "status", "leadScore (1-5)",
                  "indications", "profileUrl", "proposalSent (true/false)",
                  "ServiceNeed (Graphic/Web/Marketing)", "assignedToMarketer",
                ].map((col) => (
                  <span
                    key={col}
                    className={`px-2 py-0.5 rounded font-mono ${
                      col.includes("*") ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {col}
                  </span>
                ))}
              </div>
              <p className="mt-1.5 text-gray-400">* required field</p>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales_Bulk_Upload;