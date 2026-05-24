import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// Build slug -> lastmod map + tag -> post-count map from blog frontmatter at config load time.
// updateDate beats publishDate; falls back to build date for non-blog pages.
const blogDir = resolve("./src/content/blog");
const blogLastmod = new Map();
const tagCounts = new Map();
try {
  for (const file of readdirSync(blogDir).filter((f) => f.endsWith(".md"))) {
    const text = readFileSync(resolve(blogDir, file), "utf8");
    const fm = text.match(/^---([\s\S]*?)---/);
    if (!fm) continue;
    const pub = fm[1].match(/^publishDate:\s*([0-9-]+)/m)?.[1];
    const upd = fm[1].match(/^updateDate:\s*([0-9-]+)/m)?.[1];
    const date = upd || pub;
    if (date) {
      const slug = file.replace(/\.md$/, "");
      blogLastmod.set(`/blog/${slug}/`, new Date(date).toISOString());
    }
    const tagsLine = fm[1].match(/^tags:\s*\[(.+?)\]\s*$/m)?.[1];
    if (tagsLine) {
      const tags = [...tagsLine.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      for (const t of tags) {
        const slug = t.toLowerCase().replace(/\s+/g, "-");
        tagCounts.set(slug, (tagCounts.get(slug) || 0) + 1);
      }
    }
  }
} catch {
  /* no blog dir during partial builds — skip */
}

const THIN_TAG_THRESHOLD = 3;
const buildDate = new Date().toISOString();

export default defineConfig({
  site: "https://www.torweb.pl",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  integrations: [
    tailwind(),
    sitemap({
      // Drop noindex'd thin tag pages + the empty tag root from the sitemap entirely.
      filter(page) {
        const path = new URL(page).pathname;
        if (path === "/blog/tag/") return false;
        const tagMatch = path.match(/^\/blog\/tag\/([^/]+)\/$/);
        if (tagMatch) {
          const count = tagCounts.get(tagMatch[1]) || 0;
          if (count < THIN_TAG_THRESHOLD) return false;
        }
        return true;
      },
      serialize(item) {
        const url = new URL(item.url);
        const path = url.pathname;
        item.lastmod = blogLastmod.get(path) || buildDate;
        item.changefreq = path === "/" || path.startsWith("/blog") ? "weekly" : "monthly";
        item.priority = path === "/" ? 1.0 : path.startsWith("/blog/") && path !== "/blog/" ? 0.7 : 0.8;
        return item;
      },
    }),
  ],
  compressHTML: true,
});
