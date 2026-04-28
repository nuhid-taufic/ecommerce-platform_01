"use client";

import { useEffect } from "react";

export default function TrafficTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      let identifier = localStorage.getItem("visitor_id");
      if (!identifier) {
        identifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("visitor_id", identifier);
      }

      const deviceType = 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
          ? "mobile" 
          : "desktop";
      
      let platform = "direct";
      if (document.referrer.includes("google")) platform = "search";
      else if (document.referrer.includes("facebook") || document.referrer.includes("instagram")) platform = "social";

      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, deviceType, platform }),
        });
      } catch (error) {
        console.error("Traffic tracking failed", error);
      }
    };

    trackVisit();
  }, []);

  return null;
}
