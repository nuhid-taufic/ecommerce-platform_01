import React, { useState } from "react";
import {
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Copy,
  CheckCircle2,
  FolderOpen,
  Search,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

const initialMedia = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    name: "premium-headphone-banner.jpg",
    size: "2.4 MB",
    date: "Oct 24, 2025",
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    name: "smart-watch-promo.png",
    size: "1.8 MB",
    date: "Nov 02, 2025",
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80",
    name: "polaroid-camera-shot.jpg",
    size: "3.1 MB",
    date: "Nov 15, 2025",
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
    name: "nike-red-shoes.webp",
    size: "940 KB",
    date: "Dec 05, 2025",
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&q=80",
    name: "corporate-branding-mockup.jpg",
    size: "4.2 MB",
    date: "Jan 12, 2026",
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80",
    name: "laptop-workspace.png",
    size: "2.1 MB",
    date: "Feb 18, 2026",
  },
];

export default function Media() {
  const [mediaList, setMediaList] = useState(initialMedia);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Copy URL Logic
  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Image URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete Media Logic (Simulated)
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this media file?")) {
      setMediaList(mediaList.filter((item) => item.id !== id));
      toast.success("File deleted successfully");
    }
  };

  // Upload Logic (Simulated)
  const handleUploadClick = () => {
    toast("Cloudinary upload integration pending. UI is ready!", {
      icon: "☁️",
    });
  };

  // Filter Logic
  const filteredMedia = mediaList.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ImageIcon className="h-8 w-8 text-blue-600" /> Media Library
          </h1>
          <p className="text-slate-500 mt-1">
            Store and manage your promotional banners, product images, and
            branding assets.
          </p>
        </div>
        <button
          onClick={handleUploadClick}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
        >
          <UploadCloud className="h-5 w-5" /> Upload Assets
        </button>
      </div>

      {/* Toolbar (Search & Filter) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search media files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors">
            <Filter className="h-4 w-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors">
            <FolderOpen className="h-4 w-4" /> Folders
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
          <ImageIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">No Media Found</h3>
          <p className="text-slate-500 mt-2">
            Upload some images to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMedia.map((media) => (
            <div
              key={media.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all"
            >
              {/* Image Container */}
              <div className="aspect-square relative overflow-hidden bg-slate-100">
                <img
                  src={media.url}
                  alt={media.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Hover Overlay Actions */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                  <button
                    onClick={() => handleCopyUrl(media.id, media.url)}
                    className="p-2.5 bg-white text-blue-600 hover:bg-blue-600 hover:text-white rounded-full shadow-lg transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === media.id ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(media.id)}
                    className="p-2.5 bg-white text-red-500 hover:bg-red-500 hover:text-white rounded-full shadow-lg transition-colors"
                    title="Delete Image"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* File Info */}
              <div className="p-4">
                <p
                  className="text-sm font-bold text-slate-800 truncate mb-1"
                  title={media.name}
                >
                  {media.name}
                </p>
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                  <span>{media.size}</span>
                  <span>{media.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
