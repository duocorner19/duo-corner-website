// lib/tracker.js

// URL থেকে বিজ্ঞাপনের ট্র্যাকিং প্যারামিটার সংগ্রহকারী হেল্পার
const getTrackingContext = () => {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
      utm_content: params.get("utm_content") || undefined,
      utm_term: params.get("utm_term") || undefined,
      fbclid: params.get("fbclid") || undefined,
      gclid: params.get("gclid") || undefined,
      ttclid: params.get("ttclid") || undefined,
    };
  } catch {
    return {};
  }
};

export const trackEvent = async (
  eventName,
  { userData = {}, customData = {} } = {},
) => {
  // ব্রাউজার ও সার্ভার ডি-ডুপ্লিকেশনের জন্য ইউনিক আইডি (আপনার পূর্বের লজিক অক্ষত)
  const eventId = `ev_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const trackingContext = getTrackingContext();

  // ১. ব্রাউজার মেটা পিক্সেল কল (যদি ব্রাউজারে পিক্সেল লোড থাকে)
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, customData, { eventID: eventId });
  }

  // ২. ব্রাউজার গুগল অ্যানালিটিক্স ৪ (GA4 gtag) কল (যদি বিদ্যমান থাকে)
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, {
      ...customData,
      event_id: eventId,
    });
  }

  // ৩. ব্রাউজার টিকটক পিক্সেল কল (যদি বিদ্যমান থাকে)
  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.track(eventName, customData, { event_id: eventId });
  }

  // ৪. সার্ভার সাইড CAPI ও সেন্ট্রাল ট্র্যাকিং কল
  try {
    await fetch("/api/facebook-pixel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl:
          typeof window !== "undefined" ? window.location.href : "",
        userData,
        customData: {
          ...customData,
          ...trackingContext,
        },
      }),
    });
  } catch (error) {
    console.error("Track Event Error:", error);
  }
};
