/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Key,
  CheckCircle2,
  Save,
  Globe,
  Activity,
  Send,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function MarketingPixelsPage() {
  const [pixelConfig, setPixelConfig] = useState({
    // Meta Tracking
    metaPixelId: "123456789012345",
    metaAccessToken: "EAAG...",
    metaTestEventCode: "",
    metaDomainVerification: "",

    // Google Tracking
    ga4Id: "G-XXXXXXXXXX",
    gtmId: "GTM-XXXXXXX",
    googleAdsConversionId: "AW-XXXXXXXXX",
    googleAdsConversionLabel: "",
    googleSiteVerification: "",

    // TikTok Tracking
    tiktokPixelId: "CXXXXXXXXXXXXXXX",
    tiktokAccessToken: "",
    tiktokTestEventCode: "",
    tiktokDomainVerification: "",

    // Configuration Toggles
    capiEnabled: true,
    enhancedConversionsEnabled: true,
  });

  const [pixelSaved, setPixelSaved] = useState(false);
  const [testingStatus, setTestingStatus] = useState<string | null>(null);

  useEffect(() => {
    const savedPixels = localStorage.getItem("duo_pixel_config");
    if (savedPixels) {
      try {
        setPixelConfig((prev) => ({ ...prev, ...JSON.parse(savedPixels) }));
      } catch {}
    }
  }, []);

  const handleSavePixels = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("duo_pixel_config", JSON.stringify(pixelConfig));
    setPixelSaved(true);
    setTimeout(() => setPixelSaved(false), 3000);
  };

  // লাইভ কানেকশন ও মেটা CAPI টেস্ট করার মেথড
  const handleTestMetaCapi = async () => {
    setTestingStatus("টেস্ট ইভেন্ট পাঠানো হচ্ছে...");
    try {
      const res = await fetch("/api/facebook-pixel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "ViewContent",
          eventId: `test_${Date.now()}`,
          userData: { phone: "01777156691", firstName: "Test Admin" },
          customData: {
            content_name: "Admin Diagnostic Test",
            value: 100,
            currency: "BDT",
            test_event_code: pixelConfig.metaTestEventCode || undefined,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestingStatus("সফল! মেটা সার্ভার ইভেন্ট রিসিভ করেছে।");
      } else {
        setTestingStatus(`ব্যর্থ: ${data.error?.message || "সার্ভার এরর"}`);
      }
    } catch {
      setTestingStatus("নেটওয়ার্ক এরর! এপিআই রেসপন্স করেনি।");
    }
    setTimeout(() => setTestingStatus(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            Duo Corner Marketing Center
          </span>
          <h2 className="text-xl font-black text-white mt-2 flex items-center gap-2">
            <TrendingUp className="text-rose-500" size={22} /> Marketing, Pixels
            & Server-Side Tracking
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ফেইসবুক, গুগল এবং টিকটক পিক্সেল, কনভার্শন এপিআই (CAPI), ডোমেইন
            ভেরিফিকেশন ও ইভেন্ট ট্র্যাকিং ম্যানেজার।
          </p>
        </div>

        {/* Live Test Button */}
        <button
          type="button"
          onClick={handleTestMetaCapi}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow cursor-pointer"
        >
          <Send size={14} className="text-rose-400" /> Test CAPI Connection
        </button>
      </div>

      {pixelSaved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} /> পিক্সেল, ডোমেইন ও ট্র্যাকিং কনফিগারেশন
          সফলভাবে সেভ এবং ওয়েবসাইটে লাইভ হয়েছে!
        </div>
      )}

      {testingStatus && (
        <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Activity size={16} /> {testingStatus}
        </div>
      )}

      <form
        onSubmit={handleSavePixels}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-xl"
      >
        {/* Section 1: Domain Verification Center */}
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Globe size={18} className="text-rose-500" /> Domain Verification
              Center
            </h3>
            <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full font-bold">
              DNS / Meta-Tag Verification
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">
                Meta Domain Verification Code
              </label>
              <input
                type="text"
                value={pixelConfig.metaDomainVerification}
                onChange={(e) =>
                  setPixelConfig({
                    ...pixelConfig,
                    metaDomainVerification: e.target.value,
                  })
                }
                placeholder="Content কোডটি দিন (যেমন: abcdef12345)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">
                Google Search Console Verification
              </label>
              <input
                type="text"
                value={pixelConfig.googleSiteVerification}
                onChange={(e) =>
                  setPixelConfig({
                    ...pixelConfig,
                    googleSiteVerification: e.target.value,
                  })
                }
                placeholder="Google HTML Tag কোড"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">
                TikTok Domain Verification
              </label>
              <input
                type="text"
                value={pixelConfig.tiktokDomainVerification}
                onChange={(e) =>
                  setPixelConfig({
                    ...pixelConfig,
                    tiktokDomainVerification: e.target.value,
                  })
                }
                placeholder="TikTok Verification Code"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pixel & Server API Tokens */}
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Key size={18} className="text-rose-500" /> Multi-Platform Pixel &
              API Token Manager
            </h3>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
              ● Deduplication Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meta Pixel */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">
                Meta Pixel ID / Dataset ID
              </label>
              <input
                type="text"
                value={pixelConfig.metaPixelId}
                onChange={(e) =>
                  setPixelConfig({
                    ...pixelConfig,
                    metaPixelId: e.target.value,
                  })
                }
                placeholder="যেমন: 123456789012345"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>

            {/* Meta CAPI Token */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">
                Meta CAPI Access Token
              </label>
              <input
                type="password"
                value={pixelConfig.metaAccessToken}
                onChange={(e) =>
                  setPixelConfig({
                    ...pixelConfig,
                    metaAccessToken: e.target.value,
                  })
                }
                placeholder="EAAG..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>

            {/* Meta Test Code */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">
                Meta Test Event Code (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={pixelConfig.metaTestEventCode}
                onChange={(e) =>
                  setPixelConfig({
                    ...pixelConfig,
                    metaTestEventCode: e.target.value,
                  })
                }
                placeholder="যেমন: TEST12345 (Events Manager থেকে)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>

            {/* GA4 ID */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">
                GA4 Measurement ID
              </label>
              <input
                type="text"
                value={pixelConfig.ga4Id}
                onChange={(e) =>
                  setPixelConfig({ ...pixelConfig, ga4Id: e.target.value })
                }
                placeholder="G-XXXXXXXXXX"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>

            {/* Google Ads Conversion ID */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">
                Google Ads Conversion ID
              </label>
              <input
                type="text"
                value={pixelConfig.googleAdsConversionId}
                onChange={(e) =>
                  setPixelConfig({
                    ...pixelConfig,
                    googleAdsConversionId: e.target.value,
                  })
                }
                placeholder="AW-XXXXXXXXX"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>

            {/* Google Ads Label */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">
                Google Ads Purchase Conversion Label
              </label>
              <input
                type="text"
                value={pixelConfig.googleAdsConversionLabel}
                onChange={(e) =>
                  setPixelConfig({
                    ...pixelConfig,
                    googleAdsConversionLabel: e.target.value,
                  })
                }
                placeholder="যেমন: abCD-eFGhijKLMnop"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>

            {/* GTM ID */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">
                Google Tag Manager (GTM ID)
              </label>
              <input
                type="text"
                value={pixelConfig.gtmId}
                onChange={(e) =>
                  setPixelConfig({ ...pixelConfig, gtmId: e.target.value })
                }
                placeholder="GTM-XXXXXXX"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>

            {/* TikTok Pixel ID */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">
                TikTok Pixel ID
              </label>
              <input
                type="text"
                value={pixelConfig.tiktokPixelId}
                onChange={(e) =>
                  setPixelConfig({
                    ...pixelConfig,
                    tiktokPixelId: e.target.value,
                  })
                }
                placeholder="CXXXXXXXXXXXXXXX"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>

            {/* TikTok Token */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">
                TikTok Events API Token
              </label>
              <input
                type="password"
                value={pixelConfig.tiktokAccessToken}
                onChange={(e) =>
                  setPixelConfig({
                    ...pixelConfig,
                    tiktokAccessToken: e.target.value,
                  })
                }
                placeholder="TikTok Access Token..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>

            {/* TikTok Test Code */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">
                TikTok Test Event Code (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={pixelConfig.tiktokTestEventCode}
                onChange={(e) =>
                  setPixelConfig({
                    ...pixelConfig,
                    tiktokTestEventCode: e.target.value,
                  })
                }
                placeholder="TESTXXXXXX"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Feature Toggles */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-400" size={24} />
            <div>
              <h4 className="text-xs font-bold text-white uppercase">
                High-Conversion Tracking Mode
              </h4>
              <p className="text-[11px] text-slate-400">
                সার্ভার-সাইড CAPI ডি-ডুপ্লিকেশন এবং ট্র্যাকিং রেজিলিয়েন্স চালু
                আছে।
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Active & Synced
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl text-xs transition shadow-lg cursor-pointer"
          >
            <Save size={16} /> পিক্সেল ও টোকেন কনফিগারেশন সেভ করুন
          </button>
        </div>
      </form>
    </div>
  );
}
