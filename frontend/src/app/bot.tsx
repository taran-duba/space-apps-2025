"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Landbot: any; // We'll use any here since we don't have the Landbot types
  }
}

const LandbotChat = () => {
  useEffect(() => {
    let myLandbot: any = null; // Using any since we can't properly type the Landbot instance

    const initLandbot = () => {
      if (!myLandbot) {
        const s = document.createElement("script");
        s.type = "module";
        s.async = true;

        s.addEventListener("load", () => {
          // @ts-expect-error — Landbot is injected globally
          myLandbot = new Landbot.Livechat({
            configUrl:
              "https://storage.googleapis.com/landbot.site/v3/H-3165706-PTVYK7T5ZTFT17I2/index.json",
          });
        });

        s.src = "https://cdn.landbot.io/landbot-3/landbot-3.0.0.mjs";
        const x = document.getElementsByTagName("script")[0];
        x.parentNode?.insertBefore(s, x);
      }
    };

    window.addEventListener("mouseover", initLandbot, { once: true });
    window.addEventListener("touchstart", initLandbot, { once: true });

    // Cleanup on unmount
    return () => {
      window.removeEventListener("mouseover", initLandbot);
      window.removeEventListener("touchstart", initLandbot);
    };
  }, []);

  return null; // No visible element — Landbot injects itself into the DOM
};

export default LandbotChat;
