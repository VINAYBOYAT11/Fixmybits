import { useState, useEffect, type FormEvent, useRef } from "react";
import { reportsApi, type ReportMessage } from "../../lib/api";
import { motion } from "motion/react";
import { Send, Clock, User as UserIcon, AlertCircle } from "lucide-react";

type Props = { reportId: string; currentUserId: string };

export function ReportChat({ reportId, currentUserId }: Props) {
  const [messages, setMessages] = useState<ReportMessage[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [reportId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const msgs = await reportsApi.getMessages(reportId);
      if (mountedRef.current) setMessages(msgs);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    
    setSending(true);
    setSendError(null);
    try {
      const newMsg = await reportsApi.sendMessage(reportId, content);
      setMessages(prev => [...prev, newMsg]);
      setContent("");
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center gap-2 text-sm opacity-60">
        <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        Loading messages...
      </div>
    );
  }

  return (
    <div className="flex flex-col border-2 border-black dark:border-white rounded-2xl bg-white dark:bg-[#1a1a1a] h-[400px] overflow-hidden mt-4">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#262626]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-50">
            <UserIcon className="w-8 h-8 mb-2" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender.id === currentUserId;
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                key={msg.id || i}
                className={`flex flex-col max-w-[80%] ${isMe ? 'self-end ml-auto' : 'self-start mr-auto'}`}
              >
                {!isMe && (
                  <span className="text-xs font-bold mb-1 ml-2 opacity-60 uppercase flex items-center gap-1">
                     {msg.sender.role} &bull; {msg.sender.email.split('@')[0]}
                  </span>
                )}
                <div 
                  className={`p-3 rounded-2xl border-2 border-black dark:border-white ${
                    isMe 
                      ? 'bg-[var(--primary)] text-white rounded-tr-none' 
                      : 'bg-white dark:bg-[#333] text-current rounded-tl-none'
                  }`}
                  style={isMe ? { boxShadow: "3px 3px 0 0 rgba(0,0,0,1)" } : { boxShadow: "3px 3px 0 0 rgba(0,0,0,0.5)" }}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className={`text-[10px] items-center flex gap-1 mt-1 opacity-50 ${isMe ? 'justify-end mr-2' : 'ml-2'}`}>
                  <Clock className="w-3 h-3" /> {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </motion.div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Send error */}
      {sendError && (
        <div className="px-3 py-2 bg-red-50 dark:bg-red-950 border-t border-red-200 dark:border-red-800 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{sendError}</span>
          <button onClick={() => setSendError(null)} className="ml-auto font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-[#1a1a1a] border-t-2 border-black dark:border-white flex gap-2">
        <input 
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-full border-2 border-black dark:border-white bg-transparent outline-none focus:ring-2 ring-[var(--primary)] text-sm"
          disabled={sending}
        />
        <motion.button
          type="submit"
          disabled={sending || !content.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full bg-[var(--accent-mint)] border-2 border-black dark:border-white text-black disabled:opacity-50"
        >
          <Send className="w-5 h-5 -ml-0.5" />
        </motion.button>
      </form>
    </div>
  );
}
