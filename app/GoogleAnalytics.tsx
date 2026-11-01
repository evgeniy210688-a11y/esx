'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const measurementId = 'G-9REYBTWDLG';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    esxGoogleAnalyticsReady?: boolean;
  }
}

function safeUrl(value: string): string {
  if (!value) return '';
  try {
    const url = new URL(value);
    url.search = '';
    url.hash = '';
    url.pathname = url.pathname.replace(/^\/(chat|connect|messages)\/.*$/, '/$1/private');
    return url.toString();
  } catch { return ''; }
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);
  useEffect(() => {
    if (location.hostname !== 'www.88esx.com' && location.hostname !== '88esx.com') return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer!.push(arguments); };
    const page = safeUrl(location.href);
    if (!window.esxGoogleAnalyticsReady) {
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: page,
        page_referrer: safeUrl(document.referrer),
      });
      window.esxGoogleAnalyticsReady = true;
    }
    if (previous.current === page) return;
    window.gtag('set', {page_location: page, page_referrer: previous.current ?? safeUrl(document.referrer)});
    window.gtag('event', 'page_view', {
      send_to: measurementId,
      page_location: page,
      page_referrer: previous.current ?? safeUrl(document.referrer),
      page_title: /^\/(chat|connect|messages|account|admin)(\/|$)/.test(pathname) ? 'ESX — private area' : document.title,
    });
    previous.current = page;
  }, [pathname]);
  return <Script id="esx-google-analytics" src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />;
}
