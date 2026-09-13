import { proposalApi } from "@/api/proposalApi";
import type { Proposal } from "@/types/proposal";
import { useEffect, useState } from "react";
import { Link } from "react-router";

export default function ProposalListPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const res = await proposalApi.list({ search });
      setProposals(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setProposals([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this proposal?")) return;
    await proposalApi.remove(id);
    load();
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Proposals</h1>
        <Link to="/dashboard/sales/proposals/new" className="px-4 py-2 bg-green-600 text-white rounded-lg">
          + New Proposal
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className="border rounded p-2 flex-1"
          placeholder="Search by client name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <button onClick={load} className="px-4 py-2 border rounded-lg">Search</button>
      </div>

      <table className="w-full border text-sm bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Title</th>
            <th className="border p-2 text-left">Client</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">Amount</th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {proposals?.map((p) => (
            <tr key={p._id}>
              <td className="border p-2">{p.title}</td>
              <td className="border p-2">{p.clientName}</td>
              <td className="border p-2 capitalize">{p.status}</td>
              <td className="border p-2">
                {p.currency} {p.totalAmount}
              </td>
              <td className="border p-2 space-x-2">
                <Link to={`/dashboard/sales/proposals/${p._id}`} className="text-blue-600">Edit</Link>
                <button onClick={() => handleCopyLink(p)} className="text-blue-600">Copy Link</button>
                <button onClick={() => handleDelete(p._id!)} className="text-red-500">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}