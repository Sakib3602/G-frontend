import { useContext, useEffect, useState } from "react";
import { Mail, RefreshCw, PenSquare, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import useAxiosSales from "@/uri/useAxiosSales";
import ComposeEmailModal from "./ComposeEmailModal";
import { AuthContext } from "../Authentication/AuthProvider/AuthProvider";

interface EmailAccountSummary {
  _id: string;
  name: string;
  email: string;
  lastSyncedAt?: string;
}

interface EmailMessage {
  _id: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  direction: "sent" | "received";
  date: string;
}

const POLL_INTERVAL_MS = 60_000; // Check for new mail every 60 seconds

const Sales_Emails = () => {
  const axiosSales = useAxiosSales();
  const auth = useContext(AuthContext);
  const person = auth?.person;

  // Same as the sidebar: resolve the logged-in CRM user's _id from their email
  const { data: userData } = useQuery({
    queryKey: ["user-data", person?.email],
    enabled: Boolean(person?.email),
    queryFn: async () => {
      const res = await axiosSales.get(`/api/v1/user/${person?.email}`);
      return res.data.data;
    },
  });
  const userId: string | undefined = userData?._id;

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // ============ Connected email accounts visible to this salesman ============
  const { data: accounts = [] } = useQuery<EmailAccountSummary[]>({
    queryKey: ["email-accounts", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const res = await axiosSales.get(`/api/email/accounts?userId=${userId}`);
      return res.data;
    },
  });

  // Auto-select the first account once the list loads
  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
      setSelectedAccountId(accounts[0]._id);
    }
  }, [accounts, selectedAccountId]);

  // ============ Emails for the currently selected account ============
  const { data: emails = [], refetch: refetchEmails } = useQuery<EmailMessage[]>({
    queryKey: ["email-messages", selectedAccountId],
    enabled: Boolean(selectedAccountId && userId),
    queryFn: async () => {
      const res = await axiosSales.get(
        `/api/email/${selectedAccountId}/messages?userId=${userId}`
      );
      return res.data;
    },
  });

  const handleSync = async () => {
    if (!selectedAccountId || !userId) return;
    setSyncing(true);
    try {
      await axiosSales.post(`/api/email/${selectedAccountId}/sync`, { userId });
      await refetchEmails();
    } finally {
      setSyncing(false);
    }
  };

  // Silently re-sync every 60 seconds in the background (polling, not real-time push)
  useEffect(() => {
    if (!selectedAccountId) return;
    const interval = setInterval(handleSync, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId, userId]);

  const handleSend = async (payload: { to: string; subject: string; body: string }) => {
    if (!selectedAccountId || !userId) return;
    await axiosSales.post(`/api/email/${selectedAccountId}/send`, { userId, ...payload });
    await refetchEmails();
  };

  // "Connect Gmail" is a full-page redirect, not an axios call — hence a plain <a> href
  const connectGmailUrl = userId
    ? `${axiosSales.defaults.baseURL || ""}/api/email/auth/google?userId=${userId}`
    : "#";

  if (!userId) {
    return <p className="text-sm text-gray-500">Loading...</p>;
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Account Switcher */}
      <div className="w-56 border-r border-gray-100 overflow-y-auto flex flex-col">
        <div className="p-3 border-b border-gray-100">
          <a
            href={connectGmailUrl}
            className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#7FA23B] border border-[#7FA23B]/30 rounded-md py-2 hover:bg-[#7FA23B]/5"
          >
            <Plus className="w-3.5 h-3.5" /> Connect Gmail
          </a>
        </div>

        {accounts.length === 0 && (
          <p className="text-xs text-gray-400 p-3">No accounts connected yet</p>
        )}

        {accounts.map((acc) => (
          <button
            key={acc._id}
            onClick={() => {
              setSelectedAccountId(acc._id);
              setSelectedEmail(null);
            }}
            className={`text-left px-3 py-2.5 text-sm border-b border-gray-50 transition-colors ${
              selectedAccountId === acc._id
                ? "bg-[#7FA23B]/10 text-[#7FA23B] font-semibold"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="truncate">{acc.name}</div>
            <div className="text-[11px] text-gray-400 truncate">{acc.email}</div>
          </button>
        ))}
      </div>

      {/* Email List */}
      <div className="w-80 border-r border-gray-100 overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-gray-400" /> Inbox
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={syncing || !selectedAccountId}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              title="Sync"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowCompose(true)}
              disabled={!selectedAccountId}
              className="p-1.5 rounded-md bg-[#7FA23B] text-white hover:bg-[#6e8f33] disabled:opacity-50"
              title="Compose new email"
            >
              <PenSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {emails.length === 0 && (
          <p className="text-xs text-gray-400 p-3">No emails yet. Try syncing.</p>
        )}

        {emails.map((email) => (
          <button
            key={email._id}
            onClick={() => setSelectedEmail(email)}
            className={`text-left px-3 py-2.5 border-b border-gray-50 transition-colors ${
              selectedEmail?._id === email._id ? "bg-[#7FA23B]/10" : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span
                className={`px-1.5 py-0.5 rounded-sm font-medium ${
                  email.direction === "sent"
                    ? "bg-[#7FA23B]/10 text-[#7FA23B]"
                    : "bg-orange-50 text-orange-600"
                }`}
              >
                {email.direction === "sent" ? "Sent" : "Received"}
              </span>
              <span className="text-gray-400">
                {new Date(email.date).toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900 mt-1 truncate">
              {email.subject}
            </div>
            <div className="text-xs text-gray-400 truncate">{email.snippet}</div>
          </button>
        ))}
      </div>

      {/* Email Detail */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selectedEmail ? (
          <p className="text-sm text-gray-400">Select an email from the list to view it</p>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{selectedEmail.subject}</h2>
            <div className="text-xs text-gray-500 space-y-0.5 mb-4">
              <p>
                <span className="font-medium">From:</span> {selectedEmail.from}
              </p>
              <p>
                <span className="font-medium">To:</span> {selectedEmail.to}
              </p>
              <p>{new Date(selectedEmail.date).toLocaleString()}</p>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {selectedEmail.body || selectedEmail.snippet}
            </p>
          </div>
        )}
      </div>

      {showCompose && (
        <ComposeEmailModal onClose={() => setShowCompose(false)} onSend={handleSend} />
      )}
    </div>
  );
};

export default Sales_Emails;