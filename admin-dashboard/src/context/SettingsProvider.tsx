import React, { createContext, useContext, useEffect, useState } from "react";

// Create a global context
const SettingsContext = createContext<any>(null);

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
        const data = await res.json();

        if (data.success && data.settings) {
          setSettings(data.settings);

          // 1. Change Browser Tab Title
          if (data.settings.browserTitle) {
            document.title = data.settings.browserTitle;
          }

          // 2. Change Favicon
          if (data.settings.faviconUrl) {
            let link: HTMLLinkElement | null =
              document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement("link");
              link.rel = "icon";
              document.head.appendChild(link);
            }
            link.href = data.settings.faviconUrl;
          }

          // 3. Set Global CSS Variables (to change colors across the entire website)
          if (data.settings.colors) {
            const root = document.documentElement;
            root.style.setProperty(
              "--primary-color",
              data.settings.colors.primary,
            );
            root.style.setProperty(
              "--secondary-color",
              data.settings.colors.secondary,
            );
            root.style.setProperty(
              "--optional-color",
              data.settings.colors.optional,
            );
          }
        }
      } catch (error) {
        console.error("Failed to load global settings", error);
      }
    };

    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to access settings data from anywhere in the website
export const useSettings = () => useContext(SettingsContext);
