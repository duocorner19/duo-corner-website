// lib/tracker.js

export const trackEvent = async (
  eventName,
  { userData = {}, customData = {} } = {},
) => {
  // ব্রাউজার ও সার্ভার ডি-ডুপ্লিকেশনের জন্য ইউনিক আইডি
  const eventId = `ev_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  // ১. ব্রাউজার মেটা পিক্সেল কল (যদি ব্রাউজারে পিক্সেল লোড থাকে)
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, customData, { eventID: eventId });
  }

  // ২. সার্ভার সাইড CAPI কল
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
        customData,
      }),
    });
  } catch (error) {
    console.error("Track Event Error:", error);
  }
};
