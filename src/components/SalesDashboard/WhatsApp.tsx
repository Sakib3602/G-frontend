import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useUserData } from './Sales_Hook/User_Data';

const socket = io('https://g-backend-2-0juv.onrender.com');
const API = `https://g-backend-2-0juv.onrender.com/api/v1/whatsapp`;

interface Message {
  _id?: string;
  body: string;
  dir: 'in' | 'out';
  createdAt?: string;
  mediaUrl?: string;
  mediaType?: string;
}

interface Conversation {
  _id: string;
  phone: string;
  name: string;
  lastMsg: string;
  lastTime: string;
  unread: number;
  twilioNumber: string;
}

export default function Whatsapp() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<Conversation | null>(null);
  const twilioNumberRef = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { userData } = useUserData();
  const twilioNumber = userData?.phone || '';

  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { twilioNumberRef.current = twilioNumber; }, [twilioNumber]);

  useEffect(() => {
    if (!twilioNumber) return;
    axios
      .get(`${API}/conversations?twilioNumber=${encodeURIComponent(twilioNumber)}`)
      .then(r => setConvs(r.data))
      .catch(err => console.error('Fetch error:', err));
  }, [twilioNumber]);

  useEffect(() => {
    socket.on('wa_new_msg', ({ conv, msg }: { conv: Conversation; msg: Message }) => {
      if (conv.twilioNumber !== twilioNumberRef.current) return;
      setConvs(prev => {
        const exists = prev.find(c => c._id === conv._id);
        const updated = exists
          ? prev.map(c => c._id === conv._id
              ? { ...conv, unread: selectedRef.current?._id === conv._id ? 0 : conv.unread }
              : c)
          : [conv, ...prev];
        return updated.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
      });
      if (selectedRef.current?._id === conv._id) {
        setMsgs(prev => [...prev, msg]);
      }
    });
    return () => { socket.off('wa_new_msg'); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const openConv = async (conv: Conversation) => {
    setSelected(conv);
    setLoading(true);
    try {
      const r = await axios.get(`${API}/conversations/${conv._id}/messages`);
      setMsgs(r.data);
    } catch (err) {
      console.error('Messages error:', err);
    } finally {
      setLoading(false);
    }
    setConvs(prev => prev.map(c => c._id === conv._id ? { ...c, unread: 0 } : c));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    if (picked.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(picked);
    } else {
      setFilePreview(null);
    }
  };

  const sendReply = async () => {
  if (!reply.trim() && !file) return;
  if (!selected) return;

  const text = reply;
  const currentFile = file;

  setMsgs(prev => [...prev, {
    body: text,
    dir: 'out',
    createdAt: new Date().toISOString(),
    mediaUrl: filePreview || undefined,
    mediaType: currentFile?.type || undefined,
  }]);
  setReply('');
  setFile(null);
  setFilePreview(null);

  try {
    const formData = new FormData();
    if (text) formData.append('body', text);
    if (currentFile) formData.append('file', currentFile);

    // ← এইটা যোগ করো debug এর জন্য
    console.log('Sending formData:');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    await axios.post(
      `${API}/conversations/${selected._id}/reply`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  } catch (err: any) {
    // ← এইটা change করো
    console.error('Reply error details:', err?.response?.data);
  }
};                                   
  const renderMedia = (msg: Message) => {
    if (!msg.mediaUrl) {
      return msg.body
        ? <div style={{ color: '#111827', wordBreak: 'break-word' }}>{msg.body}</div>
        : null;
    }

    const isTwilioUrl = msg.mediaUrl.includes('api.twilio.com');
    const displayUrl = isTwilioUrl
      ? `${API}/media?url=${encodeURIComponent(msg.mediaUrl)}`
      : msg.mediaUrl;

    const type = msg.mediaType || '';

    if (type.startsWith('image/')) {
      return (
        <div>
          <img
            src={displayUrl}
            alt="Image"
            style={{ maxWidth: '100%', borderRadius: 8, display: 'block', cursor: 'pointer' }}
            onClick={() => window.open(displayUrl, '_blank')}
          />
          {msg.body && (
            <div style={{ marginTop: 6, fontSize: 13, color: '#111827' }}>{msg.body}</div>
          )}
        </div>
      );
    }

    if (type === 'application/pdf') {
      return (
        <div
          onClick={() => window.open(displayUrl, '_blank')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 0' }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            📄
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>PDF Document</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Click to open</div>
          </div>
        </div>
      );
    }

    return (
      <div
        onClick={() => window.open(displayUrl, '_blank')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 0' }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 8, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          📎
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
            {type.split('/')[1]?.toUpperCase() || 'File'}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>Click to download</div>
        </div>
      </div>
    );
  };

  const totalUnread = convs.reduce((sum, c) => sum + c.unread, 0);
  const filteredConvs = convs.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!twilioNumber) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8f9fa' }}>
        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
          <div style={{ fontSize: 14 }}>Loading inbox...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#f0f2f5' }}>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{ width: 320, background: '#fff', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e5e7eb', boxShadow: '2px 0 8px rgba(0,0,0,0.04)' }}>

        <div style={{ padding: '16px 20px', background: '#075E54', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>WhatsApp Inbox</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                {convs.length} conversations
                {totalUnread > 0 && (
                  <span style={{ marginLeft: 8, background: '#25D366', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 600 }}>
                    {totalUnread} unread
                  </span>
                )}
              </div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              💬
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, opacity: 0.6 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              style={{ width: '100%', padding: '8px 12px 8px 30px', borderRadius: 8, border: 'none', outline: 'none', fontSize: 13, background: 'rgba(255,255,255,0.15)', color: 'white', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConvs.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>No conversations yet</div>
              <div style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>Messages will appear here</div>
            </div>
          )}
          {filteredConvs.map(conv => (
            <div
              key={conv._id}
              onClick={() => openConv(conv)}
              style={{
                padding: '12px 16px', cursor: 'pointer',
                borderBottom: '1px solid #f3f4f6',
                background: selected?._id === conv._id ? '#f0fdf4' : 'white',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'background .1s',
                borderLeft: selected?._id === conv._id ? '3px solid #25D366' : '3px solid transparent',
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: `hsl(${(conv.name.charCodeAt(0) * 37) % 360}, 50%, 45%)`,
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18,
                }}>
                  {(conv.name || '?').charAt(0).toUpperCase()}
                </div>
                <div style={{ position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, borderRadius: '50%', background: '#25D366', border: '2px solid white' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <div style={{ fontWeight: conv.unread > 0 ? 700 : 500, fontSize: 14, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                    {conv.name}
                  </div>
                  <div style={{ fontSize: 11, color: conv.unread > 0 ? '#25D366' : '#9ca3af', flexShrink: 0, marginLeft: 4 }}>
                    {formatTime(conv.lastTime)}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                    {conv.lastMsg}
                  </div>
                  {conv.unread > 0 && (
                    <span style={{ background: '#25D366', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 4 }}>
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT CHAT AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selected ? (
          <>
            {/* Header */}
            <div style={{ padding: '14px 20px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: `hsl(${(selected.name.charCodeAt(0) * 37) % 360}, 50%, 45%)`,
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16,
                }}>
                  {(selected.name || '?').charAt(0).toUpperCase()}
                </div>
                <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#25D366', border: '2px solid white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{selected.phone.replace('whatsapp:', '')} · WhatsApp</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['🔍', '⋮'].map((icon, i) => (
                  <button key={i} style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 40px', background: '#efeae2', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4c5a9\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#9ca3af' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                    <div style={{ fontSize: 13 }}>Loading messages...</div>
                  </div>
                </div>
              ) : (
                <>
                  {msgs.map((msg, i) => {
                    const isOut = msg.dir === 'out';
                    const showDate = i === 0 || new Date(msg.createdAt || '').toDateString() !== new Date(msgs[i - 1]?.createdAt || '').toDateString();
                    return (
                      <div key={i}>
                        {showDate && (
                          <div style={{ textAlign: 'center', margin: '12px 0' }}>
                            <span style={{ background: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: 12, fontSize: 11, color: '#6b7280', fontWeight: 500 }}>
                              {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) : 'Today'}
                            </span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: isOut ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
                          <div style={{
                            background: isOut ? '#d9fdd3' : '#fff',
                            padding: '8px 12px 6px',
                            borderRadius: isOut ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
                            maxWidth: '60%', fontSize: 14, lineHeight: 1.5,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          }}>
                            {/* ← এখানে renderMedia call করছি */}
                            {renderMedia(msg)}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
                              <span style={{ fontSize: 11, color: '#9ca3af' }}>
                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                              {isOut && <span style={{ fontSize: 12, color: '#53bdeb' }}>✓✓</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Reply Input */}
            <div style={{ padding: '12px 16px', background: '#f0f2f5' }}>

              {/* File preview */}
              {file && (
                <div style={{ marginBottom: 8, padding: '8px 12px', background: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #e5e7eb' }}>
                  {filePreview ? (
                    <img src={filePreview} alt="preview" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 6, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      📎
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    onClick={() => { setFile(null); setFilePreview(null); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af' }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Input row */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {/* File button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: 46, height: 46, borderRadius: '50%', background: '#fff', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  📎
                </button>

                {/* Text input */}
                <div style={{ flex: 1, background: '#fff', borderRadius: 24, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '4px 8px 4px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <input
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                    placeholder="Type a message..."
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#111827', padding: '8px 0', background: 'transparent' }}
                  />
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px 6px', opacity: 0.5 }}>😊</button>
                </div>

                {/* Send button */}
                <button
                  onClick={sendReply}
                  style={{
                    width: 46, height: 46, borderRadius: '50%',
                    background: (reply.trim() || file) ? '#075E54' : '#9ca3af',
                    color: 'white', border: 'none',
                    cursor: (reply.trim() || file) ? 'pointer' : 'default',
                    fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'background .15s', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  ➤
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#9ca3af' }}>
            <div style={{ textAlign: 'center', maxWidth: 320 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 16px' }}>
                💬
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#374151', marginBottom: 8 }}>WhatsApp Inbox</div>
              <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                Select a conversation from the left to start messaging your customers.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}