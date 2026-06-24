import { useState } from "react";

interface ComposeEmailModalProps {
  onClose: () => void;
  onSend: (data: { to: string; subject: string; body: string }) => Promise<void>;
}

export default function ComposeEmailModal({ onClose, onSend }: ComposeEmailModalProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!to || !subject || !body) {
      setError("সব field পূরণ করুন");
      return;
    }
    setSending(true);
    setError("");
    try {
      await onSend({ to, subject, body });
      onClose();
    } catch {
      setError("Email পাঠাতে সমস্যা হয়েছে। Account টা reconnect করার চেষ্টা করুন।");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-gray-900 mb-3">Write New Email</h3>

        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

        <input
          placeholder="To: client@example.com"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#7FA23B]/30"
        />
        <input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#7FA23B]/30"
        />
        <textarea
          placeholder="Write Email body..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#7FA23B]/30"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="px-4 py-2 text-sm rounded-md bg-[#7FA23B] text-white hover:bg-[#6e8f33] disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}