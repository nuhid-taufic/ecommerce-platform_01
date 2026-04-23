"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, AlertCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import Link from "next/link";

export default function SupportWidget() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Chat States
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch user's existing ticket (Live Auto-Refresh every 3 seconds)
  const fetchUserTickets = async (isBackground = false) => {
    if (!user || !isOpen) return;
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets/user/${user._id || user.id}`,
      );
      const data = await res.json();
      if (data.success) {
        if (data.tickets.length > 0) {
          setActiveTicket(data.tickets[0]); // Load the most recent ticket
          if (!isBackground) setTimeout(scrollToBottom, 200);
        } else {
          setActiveTicket(null); // User has no tickets
        }
      }
    } catch (error) {
      console.error("Error fetching tickets", error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setActiveTicket(null);
      setSubject("");
      setMessage("");
    }

    if (isOpen && user) {
      fetchUserTickets();
      const interval = setInterval(() => fetchUserTickets(true), 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, user]);

  // Send new ticket or reply
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;

    setLoading(true);
    try {
      if (activeTicket) {
        // Reply to existing chat
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tickets/${activeTicket._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: message,
              sender: "customer",
              status: "Open",
            }),
          },
        );
      } else {
        // Create new ticket
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user._id || user.id,
            subject: subject || "General Inquiry",
            message: message,
          }),
        });
      }
      setMessage("");
      setSubject("");
      fetchUserTickets(false);
    } catch (error) {
      console.error("Ticket Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans text-[#111111]">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[350px] h-[500px] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-black text-white p-4 flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-bold text-sm tracking-widest uppercase">
                Live Support
              </h3>
              <p className="text-[10px] text-gray-400">
                We typically reply in a few minutes.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:opacity-70"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 flex flex-col">
            {!user ? (
              <div className="m-auto text-center">
                <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                <h4 className="font-medium mb-2">Login Required</h4>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  Log in to chat with our support team.
                </p>
                <Link
                  href="/login"
                  className="text-xs font-bold uppercase tracking-widest bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  Log In
                </Link>
              </div>
            ) : loading && !activeTicket ? (
              <div className="m-auto">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : activeTicket ? (
              // Chat Thread View
              <div className="space-y-4">
                <div className="text-center text-[10px] text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">
                  Ticket: {activeTicket.subject}
                </div>
                {activeTicket.messages.map((msg: any, idx: number) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === "customer" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-sm max-w-[85%] ${msg.sender === "customer" ? "bg-black text-white rounded-tr-sm" : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"}`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              // New Ticket Form View
              <div className="m-auto w-full">
                <h4 className="font-bold mb-4 text-center">
                  Start a Conversation
                </h4>
                <input
                  required
                  type="text"
                  placeholder="Subject (e.g. Order Issue)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:border-black transition-colors bg-white"
                />
              </div>
            )}
          </div>

          {/* Chat Input Area */}
          {user && (
            <div className="p-3 bg-white border-t border-gray-200 shrink-0">
              <form
                onSubmit={handleSendMessage}
                className="flex gap-2 relative"
              >
                <input
                  required
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-full pl-4 pr-12 py-3 focus:outline-none focus:border-black bg-gray-50"
                />
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="absolute right-1 top-1 bottom-1 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-4 w-4 ml-1" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      <button
        id="support-widget-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isOpen ? "bg-gray-200 text-black rotate-90 scale-90" : "bg-black text-white hover:scale-105"}`}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
