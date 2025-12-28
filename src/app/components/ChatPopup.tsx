import React, { useState } from 'react';

export default function ChatPopup() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{role:string,text:string}>>([]);

  async function send() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(m => [...m, {role:'user', text:userMsg}]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages.map(m => ({ role: m.role, content: m.text })) })
      });

      const jr = await res.json();
      if (!res.ok) throw new Error(jr.error || 'Chat failed');

      const reply = jr.reply || jr.text || 'No response';
      setMessages(m => [...m, {role:'assistant', text: reply}]);

    } catch (err:any) {
      setMessages(m => [...m, {role:'assistant', text: `Error: ${err.message || err}`}]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed right-6 bottom-6 bg-[#1a2847] text-white px-4 py-2 rounded-full shadow-lg z-50">AI Chat</button>

      {open && (
        <div className="fixed right-6 bottom-20 w-96 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="font-medium">AI Assistant</div>
            <button onClick={() => setOpen(false)} className="text-sm text-gray-600">Close</button>
          </div>

          <div className="p-3 h-64 overflow-auto space-y-2 bg-gray-50">
            {messages.length===0 && <div className="text-sm text-gray-500">Ask questions about laws, datasets, or the site.</div>}
            {messages.map((m,i)=>(
              <div key={i} className={m.role==='user' ? 'text-right' : ''}>
                <div className={`inline-block p-2 rounded ${m.role==='user' ? 'bg-[#ff9933] text-white' : 'bg-white text-gray-800 border'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3">
            <div className="flex gap-2">
              <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') send(); }} className="flex-1 p-2 border rounded" placeholder="Type a question" />
              <button onClick={send} disabled={loading} className="px-3 bg-[#1a2847] text-white rounded">{loading? '...' : 'Send'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
