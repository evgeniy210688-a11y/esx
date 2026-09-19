"use client";

import { Analytics } from "@vercel/analytics/next";

export default function SiteAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        const url = new URL(event.url);
        // Count visits without recording room invitations or query parameters.
        url.search = "";
        url.hash = "";
        if (url.pathname.startsWith("/chat/")) url.pathname = "/chat/[room]";
        if (url.pathname.startsWith("/connect/")) url.pathname = "/connect/[token]";
        if (url.pathname.startsWith("/messages/")) url.pathname = "/messages/[room]";
        return { ...event, url: url.toString() };
      }}
    />
  );
}
