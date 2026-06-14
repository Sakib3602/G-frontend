import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('https://g-backend-2-0juv.onrender.com');
const API = 'https://g-backend-2-0juv.onrender.com/api/v1/whatsapp';

interface Message {
  _id?: string;
  body: string;
  dir: 'in' | 'out';
  createdAt?: string;
}

interface Conversation {
  _id: string;
  phone: string;
  name: string;
  lastMsg: string;
  lastTime: string;
  unread: number;
}

export default function Whatsapp() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get(`${API}/conversations`).then(r => setConvs(r.data));
  }, []);

  useEffect(() => {
    socket.on('wa_new_msg', ({ conv, msg }: { conv: Conversation; msg: Message }) => {
      setConvs(prev => {
        const exists = prev.find(c => c._id === conv._id);
        const updated = exists
          ? prev.map(c => c._id === conv._id ? {
              ...conv,
              unread: selected?._id === conv._id ? 0 : conv.unread
            } : c)
          : [conv, ...prev];
        return updated.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
      });

      if (selected?._id === conv._id) {
        setMsgs(prev => [...prev, msg]);
      }
    });

    return () => { socket.off('wa_new_msg'); };
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const openConv = async (conv: Conversation) => {
    setSelected(conv);
    setLoading(true);
    const r = await axios.get(`${API}/conversations/${conv._id}/messages`);
    setMsgs(r.data);
    setLoading(false);
    setConvs(prev => prev.map(c => c._id === conv._id ? { ...c, unread: 0 } : c));
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    const optimistic: Message = { body: reply, dir: 'out', createdAt: new Date().toISOString() };
    setMsgs(prev => [...prev, optimistic]);
    setReply('');
    await axios.post(`${API}/conversations/${selected._id}/reply`, { body: reply });
  };

  const totalUnread = convs.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 300, borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', background: '#fff' }}>

        <div style={{ padding: '16px 20px', background: '#075E54', color: 'white' }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>
            💬 WhatsApp Inbox
            {totalUnread > 0 && (
              <span style={{ marginLeft: 8, background: '#25D366', borderRadius: 12, padding: '1px 8px', fontSize: 12 }}>
                {totalUnread}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>{convs.length} conversation</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {convs.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 14 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              এখনো কোনো message আসেনি
            </div>
          )}
          {convs.map(conv => (
            <div
              key={conv._id}
              onClick={() => openConv(conv)}
              style={{
                padding: '12px 16px', cursor: 'pointer',
                borderBottom: '1px solid #f5f5f5',
                background: selected?._id === conv._id ? '#e8f5e9' : 'white',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'background .15s'
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#128C7E', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 18, flexShrink: 0
              }}>
                {(conv.name || '?').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: conv.unread > 0 ? 700 : 500, fontSize: 14, color: '#111' }}>
                  {conv.name}
                </div>
                <div style={{ fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {conv.lastMsg}
                </div>
              </div>
              {conv.unread > 0 && (
                <span style={{
                  background: '#25D366', color: 'white',
                  borderRadius: 12, padding: '2px 8px',
                  fontSize: 11, fontWeight: 700, flexShrink: 0
                }}>
                  {conv.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
        {selected ? (
          <>
            {/* Header */}
            <div style={{ padding: '14px 20px', background: '#075E54', color: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#128C7E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
                {(selected.name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{selected.name}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{selected.phone.replace('whatsapp:', '')}</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#ECE5DD' }}>
              {loading ? (
                <div style={{ textAlign: 'center', color: '#aaa', marginTop: 40 }}>Loading...</div>
              ) : (
                msgs.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.dir === 'out' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                    <div style={{
                      background: msg.dir === 'out' ? '#DCF8C6' : 'white',
                      padding: '8px 14px',
                      borderRadius: msg.dir === 'out' ? '14px 2px 14px 14px' : '2px 14px 14px 14px',
                      maxWidth: '65%', fontSize: 14,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                    }}>
                      {msg.body}
                      <div style={{ fontSize: 10, color: '#aaa', marginTop: 4, textAlign: 'right' }}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Reply */}
            <div style={{ padding: '12px 16px', background: '#F0F0F0', display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendReply()}
                placeholder="Message লিখো..."
                style={{ flex: 1, padding: '10px 16px', borderRadius: 24, border: '1px solid #ddd', outline: 'none', fontSize: 14 }}
              />
              <button
                onClick={sendReply}
                style={{ background: '#075E54', color: 'white', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', fontSize: 18 }}
              >
                ➤
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
            <div style={{ fontSize: 60 }}>💬</div>
            <div style={{ fontSize: 15, marginTop: 12 }}>বামে কোনো contact select করো</div>
          </div>
        )}
      </div>
    </div>
  );
}