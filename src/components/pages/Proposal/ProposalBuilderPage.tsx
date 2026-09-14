import { proposalApi } from "@/api/proposalApi";
import AddSectionMenu from "@/components/Proposal/AddSectionMenu";
import SectionCard from "@/components/Proposal/SectionCard";
import { defaultDataFor, type Proposal, type Section, type SectionType } from "@/types/proposal";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";

const uuid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

export default function ProposalBuilderPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // "/dashboard/sales/proposals/new" -> "/dashboard/sales"
  // "/dashboard/marketing/proposals/123" -> "/dashboard/marketing"
  // eivabe je department theke eshechi shei department er base path automatically dhore nei,
  // tai ekই component sales ar marketing dutoteई kaj kore, kono hardcode lage na
  const basePath = location.pathname.split("/proposals")[0];

  const [proposal, setProposal] = useState<Proposal>({
    title: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    sections: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      proposalApi.getById(id).then((res) => setProposal(res.data.data));
    }
  }, [id]);

  const addSection = (type: SectionType) => {
    const newSection: Section = {
      sectionId: uuid(),
      type,
      order: proposal.sections.length,
      data: defaultDataFor(type),
    };
    setProposal({ ...proposal, sections: [...proposal.sections, newSection] });
  };

  const updateSectionData = (index: number, data: any) => {
    const next = [...proposal.sections];
    next[index] = { ...next[index], data };
    setProposal({ ...proposal, sections: next });
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    const next = [...proposal.sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    next.forEach((s, i) => (s.order = i));
    setProposal({ ...proposal, sections: next });
  };

  const deleteSection = (index: number) => {
    const next = proposal.sections.filter((_, i) => i !== index);
    next.forEach((s, i) => (s.order = i));
    setProposal({ ...proposal, sections: next });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        const res = await proposalApi.update(id, proposal);
        setProposal(res.data.data);
      } else {
        const res = await proposalApi.create(proposal);
        setProposal(res.data.data);
        navigate(`${basePath}/proposals/${res.data.data._id}`, { replace: true });
      }
      alert("Saved successfully");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!proposal._id) return alert("Age save koro");
    const res = await proposalApi.preview(proposal._id);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(res.data as any);
      win.document.close();
    }
  };

  const handleCopyShareLink = async () => {
    if (!proposal._id || !proposal.shareToken) return alert("Age save koro");
    const link = proposalApi.shareUrl(proposal.shareToken);
    try {
      await navigator.clipboard.writeText(link);
      alert("Share link copied!\n\n" + link);
    } catch {
      window.prompt("Copy this link:", link);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">{id ? "Edit Proposal" : "New Proposal"}</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <input
          className="border rounded p-2"
          placeholder="Proposal Title"
          value={proposal.title}
          onChange={(e) => setProposal({ ...proposal, title: e.target.value })}
        />
        <input
          className="border rounded p-2"
          placeholder="Client Name"
          value={proposal.clientName}
          onChange={(e) => setProposal({ ...proposal, clientName: e.target.value })}
        />
        <input
          className="border rounded p-2"
          placeholder="Client Email"
          value={proposal.clientEmail}
          onChange={(e) => setProposal({ ...proposal, clientEmail: e.target.value })}
        />
        <input
          className="border rounded p-2"
          placeholder="Client Phone"
          value={proposal.clientPhone}
          onChange={(e) => setProposal({ ...proposal, clientPhone: e.target.value })}
        />
      </div>

      <div className="mb-4">
        <AddSectionMenu onAdd={addSection} />
      </div>

      {proposal.sections.map((section, index) => (
        <SectionCard
          key={section.sectionId}
          section={section}
          onChange={(data) => updateSectionData(index, data)}
          onMoveUp={() => moveSection(index, -1)}
          onMoveDown={() => moveSection(index, 1)}
          onDelete={() => deleteSection(index)}
        />
      ))}

      <div className="flex gap-3 mt-6">
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={handlePreview} className="px-4 py-2 border rounded-lg">
          Preview
        </button>
        {proposal._id && (
          <button onClick={handleCopyShareLink} className="px-4 py-2 bg-green-600 text-white rounded-lg">
            Copy Share Link
          </button>
        )}
      </div>
    </div>
  );
}