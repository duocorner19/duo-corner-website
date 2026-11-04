/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata, Viewport } from "next";
import { Hind_Siliguri } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import BackspacePreventer from "@/components/BackspacePreventer";
import Script from "next/script";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Duo Corner | Exclusive Couple Gifts | Cash on Delivery",
  description:
    "Premium couple gift boxes, matching bracelets and exclusive couple collections.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#e11d48",
};

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const FACEBOOK_DOMAIN_VERIFICATION =
  process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION;
const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="bn">
        <head>
          {/* Facebook Domain Verification */}
          {FACEBOOK_DOMAIN_VERIFICATION && (
            <meta
              name="facebook-domain-verification"
              content={FACEBOOK_DOMAIN_VERIFICATION}
            />
          )}

          {/* Google Search Console Verification */}
          {GOOGLE_SITE_VERIFICATION && (
            <meta
              name="google-site-verification"
              content={GOOGLE_SITE_VERIFICATION}
            />
          )}

          {/* Facebook Pixel Code */}
          {FB_PIXEL_ID && (
            <Script
              id="fb-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window,document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${FB_PIXEL_ID}');
                  fbq('track', 'PageView');
                `,
              }}
            />
          )}

          {/* Google Analytics 4 (GA4) Integration (যদি এনভায়রনমেন্ট ভ্যারিয়েবলে থাকে) */}
          {GA_MEASUREMENT_ID && (
            <>
              <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              />
              <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_MEASUREMENT_ID}', {
                      page_path: window.location.pathname,
                    });
                  `,
                }}
              />
            </>
          )}

          {/* Marketing Attribution Capture (UTM, fbclid, gclid সংরক্ষণ করার স্ক্রিপ্ট) */}
          <Script
            id="marketing-attribution"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const params = new URLSearchParams(window.location.search);
                    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
                    let attribution = JSON.parse(sessionStorage.getItem('duo_attribution') || '{}');
                    
                    let hasNew = false;
                    utmKeys.forEach(key => {
                      if (params.has(key)) {
                        attribution[key] = params.get(key);
                        hasNew = true;
                      }
                    });
                    
                    if (hasNew) {
                      attribution['landing_page'] = window.location.pathname;
                      attribution['timestamp'] = new Date().toISOString();
                      sessionStorage.setItem('duo_attribution', JSON.stringify(attribution));
                    }
                  } catch(e) {}
                })();
              `,
            }}
          />
        </head>
        <body className={`${hindSiliguri.variable} antialiased font-sans`}>
          {FB_PIXEL_ID && (
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          )}
          <BackspacePreventer />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
