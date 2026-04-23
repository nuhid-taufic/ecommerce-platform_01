import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Trash2, X, Edit2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Journal() {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    image: "",
    excerpt: "",
    content: "",
    readTime: "5 min read",
    isFeatured: false,
    status: "published",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchJournals = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/journal`);
      const data = await res.json();
      if (res.ok && data.success) {
        setJournals(data.journals);
      }
    } catch (error) {
      toast.error("Failed to fetch journals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading(
      editingId ? "Updating article..." : "Publishing article...",
    );

    try {
      const url = editingId
        ? `${import.meta.env.VITE_API_URL}/journal/${editingId}`
        : `${import.meta.env.VITE_API_URL}/journal`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(editingId ? "Article updated!" : "Article published!", {
          id: toastId,
        });
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
          title: "",
          slug: "",
          category: "",
          image: "",
          excerpt: "",
          content: "",
          readTime: "5 min read",
          isFeatured: false,
          status: "published",
        });
        fetchJournals();
      } else {
        toast.error(data.message || "Failed to save", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error", { id: toastId });
    }
  };

  const handleEdit = (journal: any) => {
    setFormData({
      title: journal.title,
      slug: journal.slug,
      category: journal.category,
      image: journal.image,
      excerpt: journal.excerpt,
      content: journal.content,
      readTime: journal.readTime,
      isFeatured: journal.isFeatured,
      status: journal.status,
    });
    setEditingId(journal._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this article?")) return;
    const toastId = toast.loading("Deleting...");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/journal/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Deleted successfully", { id: toastId });
        fetchJournals();
      }
    } catch (error) {
      toast.error("Failed to delete", { id: toastId });
    }
  };

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData({ ...formData, title, slug });
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" /> Journal & Articles
          </h1>
          <p className="text-slate-500 mt-1">
            Write and publish articles for your storefront.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              title: "",
              slug: "",
              category: "",
              image: "",
              excerpt: "",
              content: "",
              readTime: "5 min read",
              isFeatured: false,
              status: "published",
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
        >
          <Plus className="h-5 w-5" /> Write Article
        </button>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="text-center py-10 font-bold text-slate-500">
          Loading articles...
        </div>
      ) : journals.length === 0 ? (
        <div className="text-center py-10 font-bold text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
          No articles published yet. Write your first one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journals.map((journal) => (
            <div
              key={journal._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group flex flex-col"
            >
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                {journal.image && (
                  <img
                    src={journal.image}
                    alt={journal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                {journal.isFeatured && (
                  <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                    Featured
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {journal.category}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${journal.status === "published" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"}`}
                  >
                    {journal.status}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2 line-clamp-2">
                  {journal.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                  {journal.excerpt}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-400">
                    {new Date(journal.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(journal)}
                      className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(journal._id)}
                      className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50 shrink-0">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {editingId ? (
                  <Edit2 className="h-5 w-5 text-blue-600" />
                ) : (
                  <Plus className="h-5 w-5 text-blue-600" />
                )}
                {editingId ? "Edit Article" : "New Article"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Article Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="e.g. The Art of Minimalism"
                    className="w-full px-4 py-3 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-4 py-3 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g. Design"
                    className="w-full px-4 py-3 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Read Time
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.readTime}
                    onChange={(e) =>
                      setFormData({ ...formData, readTime: e.target.value })
                    }
                    placeholder="5 min read"
                    className="w-full px-4 py-3 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-3 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-3 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Excerpt (Short Description)
                </label>
                <textarea
                  required
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="A brief summary of the article..."
                  rows={2}
                  className="w-full px-4 py-3 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                  <span>Main Content (HTML Supported)</span>
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="<p>Write your full article here...</p>"
                  rows={10}
                  className="w-full px-4 py-3 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="isFeatured"
                  className="font-bold text-slate-700 cursor-pointer"
                >
                  Set as Featured Article (Shows at top of Journal)
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                {editingId ? "Save Changes" : "Publish Article"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
