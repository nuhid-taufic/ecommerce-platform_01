import React, { useEffect, useState, useRef } from "react";
import { Mail, Loader2, CheckCircle2, Clock, Send, Copy } from "lucide-react";
import toast from "react-hot-toast";

export default function Helpdesk() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const prevTicketsLength = useRef(0);
  const prevMessagesLength = useRef<{ [key: string]: number }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchTickets = async (isBackground = false) => {
    try {
      const token =
        localStorage.getItem("token") ||
        JSON.parse(localStorage.getItem("user") || "{}")?.token;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        const newTickets = data.tickets;

        if (isBackground && newTickets.length > prevTicketsLength.current) {
          toast("New Support Ticket Received!", { icon: "🔔" });
        }

        if (isBackground) {
          newTickets.forEach((t: any) => {
            const oldLength = prevMessagesLength.current[t._id] || 0;
            if (
              t.messages.length > oldLength &&
              t.messages[t.messages.length - 1].sender === "customer"
            ) {
              const senderName = t.guestName || t.user?.name || "Customer";
              toast(`New message from ${senderName}`, { icon: "💬" });
            }
            prevMessagesLength.current[t._id] = t.messages.length;
          });
        } else {
          newTickets.forEach((t: any) => {
            prevMessagesLength.current[t._id] = t.messages.length;
          });
        }

        prevTicketsLength.current = newTickets.length;
        setTickets(newTickets);

        if (selectedTicket) {
          const updatedSelected = newTickets.find(
            (t: any) => t._id === selectedTicket._id,
          );
          if (
            updatedSelected &&
            updatedSelected.messages.length > selectedTicket.messages.length
          ) {
            setSelectedTicket(updatedSelected);
            setTimeout(scrollToBottom, 100);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load tickets");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(() => fetchTickets(true), 3000);
    return () => clearInterval(interval);
  }, [selectedTicket]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const token =
        localStorage.getItem("token") ||
        JSON.parse(localStorage.getItem("user") || "{}")?.token;
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/tickets/${selectedTicket._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: replyText,
            status: "Resolved",
            sender: "admin",
          }),
        },
      );
      if (res.ok) {
        setReplyText("");
        fetchTickets(false);
        setTimeout(scrollToBottom, 200);
      }
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  // Helper functions for displaying name and email
  const getDisplayName = (ticket: any) =>
    ticket?.guestName || ticket?.user?.name || "Guest Customer";
  const getDisplayEmail = (ticket: any) =>
    ticket?.guestEmail || ticket?.user?.email || "No email provided";

  if (loading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] gap-6 font-sans">
      {/* Left: Ticket List */}
      <div className="w-full md:w-1/3 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Mail className="h-5 w-5" /> Inquiries & Tickets
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {tickets.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No pending tickets.
            </div>
          ) : (
            tickets.map((ticket) => (
              <button
                key={ticket._id}
                onClick={() => {
                  setSelectedTicket(ticket);
                  setTimeout(scrollToBottom, 200);
                }}
                className={`w-full text-left p-4 rounded-lg transition-all border ${selectedTicket?._id === ticket._id ? "border-blue-500 bg-blue-50" : "border-transparent hover:bg-slate-50"}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-slate-900 truncate pr-2">
                    {ticket.subject}
                  </span>
                  {ticket.status === "Open" ? (
                    <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  )}
                </div>
                {/* Name and Email show clearly in the list */}
                <div className="flex flex-col gap-0.5 mt-2">
                  <p className="text-xs font-semibold text-slate-700 truncate">
                    {getDisplayName(ticket)}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {getDisplayEmail(ticket)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: Chat Thread & Info */}
      <div className="w-full md:w-2/3 bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm overflow-hidden">
        {selectedTicket ? (
          <>
            <div className="p-6 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {selectedTicket.subject}
                  </h3>

                  {/* 🚀 Clickable Email for Manual Reply */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      {getDisplayName(selectedTicket)}
                    </span>
                    <span className="text-sm text-slate-400">•</span>
                    <a
                      href={`mailto:${getDisplayEmail(selectedTicket)}?subject=Re: ${selectedTicket.subject}`}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      title="Click to send email manually"
                    >
                      {getDisplayEmail(selectedTicket)}
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          getDisplayEmail(selectedTicket),
                        );
                        toast.success("Email copied!");
                      }}
                      className="ml-2 text-slate-400 hover:text-slate-600"
                      title="Copy Email"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${selectedTicket.status === "Open" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}
                >
                  {selectedTicket.status}
                </span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {selectedTicket.messages.map((msg: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex flex-col w-full ${msg.sender === "admin" ? "items-end" : "items-start"}`}
                >
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1 px-2">
                    {msg.sender === "admin"
                      ? "Support Team"
                      : getDisplayName(selectedTicket)}
                  </span>
                  <div
                    className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed max-w-[80%] ${msg.sender === "admin" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"}`}
                  >
                    {msg.message}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box for On-Site Reply */}
            <div className="p-4 border-t border-slate-200 bg-white shrink-0">
              <div className="text-[10px] text-slate-400 font-medium mb-2 pl-1">
                Replying here will only show on the website's live chat. To send
                an email, click the email address above.
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReply()}
                  placeholder="Type your reply here for live chat..."
                  className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleReply}
                  disabled={sending || !replyText.trim()}
                  className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {sending ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Mail className="h-16 w-16 mb-4 opacity-20" />
            <p>Select an inquiry to view details and reply.</p>
          </div>
        )}
      </div>
    </div>
  );
}
