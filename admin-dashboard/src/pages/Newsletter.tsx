import React, { useState, useEffect } from "react";
import { Mail, Send, Users, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function Newsletter() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"subscribers" | "broadcast">(
    "subscribers",
  );

  // Broadcast Form State
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [sending, setSending] = useState(false);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/newsletter/subscribers`,
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribers(data.subscribers);
      }
    } catch (error) {
      toast.error("Failed to fetch subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !window.confirm(
        "Are you sure you want to send this email blast to ALL active subscribers?",
      )
    ) {
      return;
    }

    setSending(true);
    const toastId = toast.loading("Sending broadcast...");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/newsletter/broadcast`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, htmlBody }),
        },
      );
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message, { id: toastId });
        setSubject("");
        setHtmlBody("");
        setActiveTab("subscribers");
      } else {
        toast.error(data.message || "Failed to send", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error", { id: toastId });
    } finally {
      setSending(false);
    }
  };

  const activeSubscribersCount = subscribers.filter(
    (s) => s.status === "subscribed",
  ).length;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Mail className="h-8 w-8 text-blue-600" /> Newsletter & Broadcasts
          </h1>
          <p className="text-slate-500 mt-1">
            Manage subscribers and send bulk email updates.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Total Subscribers
            </p>
            <p className="text-3xl font-black text-slate-900">
              {subscribers.length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Active Audience
            </p>
            <p className="text-3xl font-black text-slate-900">
              {activeSubscribersCount}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-slate-200">
        <button
          className={`py-3 px-6 font-bold text-sm tracking-wide transition-all border-b-2 ${activeTab === "subscribers" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          onClick={() => setActiveTab("subscribers")}
        >
          Subscribers List
        </button>
        <button
          className={`py-3 px-6 font-bold text-sm tracking-wide transition-all border-b-2 ${activeTab === "broadcast" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          onClick={() => setActiveTab("broadcast")}
        >
          Send Broadcast Email
        </button>
      </div>

      {/* Subscribers Tab */}
      {activeTab === "subscribers" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-widest text-slate-500 font-bold">
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Subscribed On</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-8 text-center text-slate-500 font-medium"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : subscribers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-8 text-center text-slate-500 font-medium"
                    >
                      No subscribers yet.
                    </td>
                  </tr>
                ) : (
                  subscribers.map((sub) => (
                    <tr
                      key={sub._id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4 font-medium text-slate-800">
                        {sub.email}
                      </td>
                      <td className="p-4 text-slate-500 text-sm">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest ${sub.status === "subscribed" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                        >
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Broadcast Tab */}
      {activeTab === "broadcast" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <div className="mb-6 pb-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800">
              Compose Broadcast
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              This email will be sent via BCC to all {activeSubscribersCount}{" "}
              active subscribers.
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
                Email Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. 50% Off Our New Summer Collection!"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
                Email Body (HTML Supported)
              </label>
              <textarea
                required
                value={htmlBody}
                onChange={(e) => setHtmlBody(e.target.value)}
                placeholder="<p>Hello! Check out our latest updates...</p>"
                rows={12}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              ></textarea>
              <p className="text-xs text-slate-400 mt-2">
                You can use standard HTML tags like &lt;h1&gt;, &lt;p&gt;,
                &lt;strong&gt;, and &lt;a href="..."&gt;.
              </p>
            </div>

            <button
              type="submit"
              disabled={sending || activeSubscribersCount === 0}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send to {activeSubscribersCount} Subscribers
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
