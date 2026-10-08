import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://leos.example.com";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep the admin panel and order confirmations out of search engines.
        disallow: ["/admin", "/api/", "/order/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
