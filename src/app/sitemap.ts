import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/programme", "/setup", "/contests", "/legal", "/privacy"];
  return routes.map((path) => ({
    url: `${SITE.url}${path}/`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}

// Requis par Next 16 avec output: "export".
export const dynamic = "force-static";
