"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Save, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function BentoBoxControl() {
  const [bentoBoxData, setBentoBoxData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/home-settings`,
        );
        const data = await res.json();
        if (data.success && data.settings) {
          setBentoBoxData(data.settings.bentoBox || []);
        }
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const addBlock = () =>
    setBentoBoxData([
      ...bentoBoxData,
      { title: "New Category", imageUrls: [""], linkTo: "/shop" },
    ]);
  const removeBlock = (index: number) =>
    setBentoBoxData(bentoBoxData.filter((_, i) => i !== index));

  const handleInputChange = (index: number, field: string, value: string) => {
    const newData = [...bentoBoxData];
    newData[index][field] = value;
    setBentoBoxData(newData);
  };

  const addImage = (blockIndex: number) => {
    const newData = [...bentoBoxData];
    newData[blockIndex].imageUrls.push("");
    setBentoBoxData(newData);
  };
  const updateImage = (blockIndex: number, imgIndex: number, value: string) => {
    const newData = [...bentoBoxData];
    newData[blockIndex].imageUrls[imgIndex] = value;
    setBentoBoxData(newData);
  };
  const removeImage = (blockIndex: number, imgIndex: number) => {
    const newData = [...bentoBoxData];
    newData[blockIndex].imageUrls = newData[blockIndex].imageUrls.filter(
      (_, i) => i !== imgIndex,
    );
    setBentoBoxData(newData);
  };

  const handleSave = async () => {
    setIsSaving(true);
    toast.loading("Saving changes...", { id: "save-bento" });
    try {
      const token =
        localStorage.getItem("token") ||
        JSON.parse(localStorage.getItem("user") || "{}")?.token;
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/home-settings/bento-box`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bentoBox: bentoBoxData }),
        },
      );
      const data = await res.json();
      if (data.success)
        toast.success("Categories updated successfully!", { id: "save-bento" });
      else toast.error("Update failed", { id: "save-bento" });
    } catch (error) {
      toast.error("Something went wrong!", { id: "save-bento" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans text-[#111111]">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Dynamic Categories Control
          </h1>
          <p className="text-gray-500">
            Add unlimited categories and up to 3-4 images per category for a
            smooth slideshow effect.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest bg-black text-white hover:bg-gray-800 flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save All Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bentoBoxData.map((block, bIndex) => (
          <div
            key={bIndex}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative"
          >
            <button
              onClick={() => removeBlock(bIndex)}
              className="absolute top-4 right-4 text-red-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              Category #{bIndex + 1}
            </h3>

            <div className="mb-4">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 block">
                Category Title
              </label>
              <input
                type="text"
                value={block.title}
                onChange={(e) =>
                  handleInputChange(bIndex, "title", e.target.value)
                }
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-black outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2 block flex justify-between">
                Slideshow Images{" "}
                <button
                  onClick={() => addImage(bIndex)}
                  className="text-blue-500 hover:underline"
                >
                  + Add Image
                </button>
              </label>
              <div className="space-y-2">
                {block.imageUrls?.map((url: string, iIndex: number) => (
                  <div key={iIndex} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Image URL..."
                      value={url}
                      onChange={(e) =>
                        updateImage(bIndex, iIndex, e.target.value)
                      }
                      className="flex-1 border border-gray-200 rounded-lg py-2 px-3 text-xs outline-none"
                    />
                    <button
                      onClick={() => removeImage(bIndex, iIndex)}
                      className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Category Button */}
        <button
          onClick={addBlock}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:text-black hover:border-black transition-colors min-h-[300px]"
        >
          <Plus className="h-8 w-8 mb-2" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Add New Category
          </span>
        </button>
      </div>
    </div>
  );
}
