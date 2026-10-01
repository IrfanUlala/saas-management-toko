"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import Image from "next/image";

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the PWA install prompt");
    }

    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 md:px-6 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50 flex justify-center items-center animate-in slide-in-from-bottom duration-300">
      <div className="w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
            <Image
              src="/icon.png"
              alt="Toman Logo"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Instal Toman</p>
            <p className="text-xs text-gray-500">Akses lebih mudah & cepat</p>
          </div>
        </div>
        <Button
          onClick={handleInstallClick}
          className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Instal
        </Button>
      </div>
    </div>
  );
}
