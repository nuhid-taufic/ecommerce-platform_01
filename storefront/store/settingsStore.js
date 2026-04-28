import { create } from 'zustand';

export const useSettingsStore = create((set) => ({
  settings: null,
  fetchSettings: async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
      const data = await res.json();
      if (data.success) {
        set({ settings: data.settings });
        
        // Apply Global CSS variables dynamically
        if (typeof document !== 'undefined' && data.settings.colors) {
            const root = document.documentElement;
            if(data.settings.colors.primary) root.style.setProperty("--primary-color", data.settings.colors.primary);
            if(data.settings.colors.secondary) root.style.setProperty("--secondary-color", data.settings.colors.secondary);
            if(data.settings.colors.optional) root.style.setProperty("--accent-color", data.settings.colors.optional); // Map optional to accent
        }
        
        if (typeof document !== 'undefined' && data.settings.faviconUrl) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement("link");
                link.rel = "icon";
                document.head.appendChild(link);
            }
            link.href = data.settings.faviconUrl;
        }

        if (typeof document !== 'undefined' && data.settings.browserTitle) {
            document.title = data.settings.browserTitle;
        }
      }
    } catch (error) {
      console.error("Failed to fetch global settings", error);
    }
  }
}));
