import { proposalApi, type ProposalPagination } from "@/api/proposalApi";
import type { Proposal } from "@/types/proposal";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { AuthContext } from "@/components/Authentication/AuthProvider/AuthProvider";

const PAGE_SIZE = 25;
const STATUS_OPTIONS = ["draft", "sent", "approved", "rejected"];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function creatorName(createdBy: Proposal["createdBy"]) {
  if (!createdBy) return "—";
  if (typeof createdBy === "string") return createdBy;
  return createdBy.name || createdBy.email || "—";
}

function creatorId(createdBy: Proposal["createdBy"]): string | null {
  if (!createdBy) return null;
  if (typeof createdBy === "string") return createdBy;
  return createdBy._id || null;
}

export default function ProposalListPage() {
  const location = useLocation();
  const basePath = location.pathname.split("/proposals")[0];

  const auth = useContext(AuthContext);
  const currentUserId = (auth?.person as any)?._id || (auth?.person as any)?.id || null;

  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<ProposalPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = async (searchVal: string, pageVal: number, scopeVal: "mine" | "all") => {
    setLoading(true);
    try {
      const res = await proposalApi.list({ search: searchVal, page: pageVal, limit: PAGE_SIZE, scope: scopeVal });
      setProposals(Array.isArray(res.data?.data) ? res.data.data : []);
      setPagination(res.data.pagination || null);
    } catch {
      setProposals([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(search, page, scope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // scope (tab) change hole page 1 e ferot, notun kore load
  useEffect(() => {
    setPage(1);
    load(search, 1, scope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (page === 1) {
        load(search, 1, scope);
      } else {
        setPage(1);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this proposal?")) return;
    await proposalApi.remove(id);
    load(search, page, scope);
  };

  const handleCopyLink = async (p: Proposal) => {
    if (!p.shareToken) return alert("Ei proposal e share link nai, edit kore save koro");
    const link = proposalApi.shareUrl(p.shareToken);
    try {
      await navigator.clipboard.writeText(link);
      alert("Share link copied!\n\n" + link);
    } catch {
      window.prompt("Copy this link:", link);
    }
  };

  const handleStatusChange = async (p: Proposal, newStatus: string) => {
    if (!p._id) return;
    setUpdatingId(p._id);
    try {
      const res = await proposalApi.updateStatus(p._id, newStatus);
      setProposals((prev) => prev.map((item) => (item._id === p._id ? res.data.data : item)));
    } catch {
      alert("Status update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Proposals</h1>
        <Link to={`${basePath}/proposals/new`} className="px-4 py-2 bg-green-600 text-white rounded-lg">
          + New Proposal
        </Link>
      </div>

      <div className="flex gap-2 mb-4 border-b">
        <button
          onClick={() => setScope("mine")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            scope === "mine" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
          }`}
        >
          My Proposals
        </button>
        <button
          onClick={() => setScope("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            scope === "all" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
          }`}
        >
          All
        </button>
      </div>

      <div className="mb-4">
        <input
          className="border rounded p-2 w-full"
          placeholder="Search by client name, phone, or proposal no."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="w-full border text-sm bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">No.</th>
            <th className="border p-2 text-left">Title</th>
            <th className="border p-2 text-left">Client</th>
            <th className="border p-2 text-left">Phone</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">Sent On</th>
            <th className="border p-2 text-left">Amount</th>
            <th className="border p-2 text-left">Created By</th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={9} className="border p-4 text-center text-gray-400">Loading...</td>
            </tr>
          )}
          {!loading && proposals.length === 0 && (
            <tr>
              <td colSpan={9} className="border p-4 text-center text-gray-400">No proposals found</td>
            </tr>
          )}
          {!loading &&
            proposals.map((p) => {
              const isOwner = scope === "mine" || (currentUserId && creatorId(p.createdBy) === currentUserId);

              return (
                <tr key={p._id}>
                  <td className="border p-2 font-mono text-gray-500">
                    {p.proposalNumber ? `#${p.proposalNumber}` : "—"}
                  </td>
                  <td className="border p-2">{p.title}</td>
                  <td className="border p-2">{p.clientName}</td>
                  <td className="border p-2">{p.clientPhone || "—"}</td>
                  <td className="border p-2">
                    {isOwner ? (
                      <select
                        value={p.status || "draft"}
                        disabled={updatingId === p._id}
                        onChange={(e) => handleStatusChange(p, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded border-0 capitalize ${
                          STATUS_COLORS[p.status || "draft"]
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded capitalize ${
                          STATUS_COLORS[p.status || "draft"]
                        }`}
                      >
                        {p.status || "draft"}
                      </span>
                    )}
                  </td>
                  <td className="border p-2 text-gray-500">{formatDate(p.sentAt)}</td>
                  <td className="border p-2">
                    {p.currency} {p.totalAmount}
                  </td>
                  <td className="border p-2 text-gray-500">{creatorName(p.createdBy)}</td>
                  <td className="border p-2 space-x-2 whitespace-nowrap">
                    {isOwner ? (
                      <Link to={`${basePath}/proposals/${p._id}`} className="text-blue-600">Edit</Link>
                    ) : (
                      <span className="text-gray-300">Edit</span>
                    )}
                    <button onClick={() => handleCopyLink(p)} className="text-blue-600">Copy Link</button>
                    {isOwner ? (
                      <button onClick={() => handleDelete(p._id!)} className="text-red-500">Delete</button>
                    ) : (
                      <span className="text-gray-300">Delete</span>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}