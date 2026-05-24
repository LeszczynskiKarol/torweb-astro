// One-off asset generator: produces logo.png, apple-touch-icon.png, og-image.jpg, og-default.jpg
// Run: node scripts/gen-assets.mjs
import sharp from 'sharp';
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');

const logoSvg = readFileSync(resolve(publicDir, 'logo.svg'));

// Build the 1200x630 OG SVG inline (text + brand mark)
const ogSvg = (variant) => Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050506"/>
      <stop offset="100%" stop-color="#0d0e10"/>
    </linearGradient>
    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#2aa3ff"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="950" cy="180" r="280" fill="url(#glow)"/>
  <circle cx="220" cy="500" r="220" fill="url(#glow)" opacity="0.6"/>
  <!-- Brand mark T (left) -->
  <g transform="translate(80,200)">
    <rect x="0" y="0" width="160" height="32" rx="6" fill="url(#brand)"/>
    <rect x="64" y="0" width="32" height="160" rx="6" fill="url(#brand)"/>
  </g>
  <!-- Wordmark + tagline -->
  <text x="280" y="280" font-family="Plus Jakarta Sans, Segoe UI, system-ui, sans-serif" font-size="92" font-weight="800" fill="#ffffff">
    TorWeb<tspan fill="url(#brand)">.pl</tspan>
  </text>
  <text x="280" y="340" font-family="Plus Jakarta Sans, Segoe UI, system-ui, sans-serif" font-size="34" font-weight="600" fill="#9ca3af">
    ${variant === 'blog' ? 'Blog &#8212; wiedza o web dev i AI' : 'Agencja Interaktywna &#8212; Toru&#324;'}
  </text>
  <!-- Service chips -->
  <g font-family="JetBrains Mono, monospace" font-size="22" font-weight="500" fill="#e5e7eb">
    <rect x="80" y="450" width="240" height="56" rx="28" fill="none" stroke="#10b981" stroke-width="2" opacity="0.7"/>
    <text x="200" y="487" text-anchor="middle">Strony WWW</text>
    <rect x="340" y="450" width="280" height="56" rx="28" fill="none" stroke="#2aa3ff" stroke-width="2" opacity="0.7"/>
    <text x="480" y="487" text-anchor="middle">Sklepy e-commerce</text>
    <rect x="640" y="450" width="240" height="56" rx="28" fill="none" stroke="#10b981" stroke-width="2" opacity="0.7"/>
    <text x="760" y="487" text-anchor="middle">Aplikacje SaaS</text>
    <rect x="900" y="450" width="220" height="56" rx="28" fill="none" stroke="#2aa3ff" stroke-width="2" opacity="0.7"/>
    <text x="1010" y="487" text-anchor="middle">Integracje AI</text>
  </g>
  <!-- URL -->
  <text x="600" y="590" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="24" fill="#6b7280">
    www.torweb.pl
  </text>
</svg>`);

const tasks = [
  { name: 'logo.png',              input: logoSvg,           out: 'logo.png',              w: 240, h: 240, format: 'png' },
  { name: 'apple-touch-icon.png',  input: logoSvg,           out: 'apple-touch-icon.png',  w: 180, h: 180, format: 'png' },
  { name: 'og-image.jpg',          input: ogSvg('home'),     out: 'og-image.jpg',          w: 1200, h: 630, format: 'jpg' },
  { name: 'og-default.jpg',        input: ogSvg('blog'),     out: 'og-default.jpg',        w: 1200, h: 630, format: 'jpg' },
];

for (const t of tasks) {
  let img = sharp(t.input).resize(t.w, t.h, { fit: 'cover' });
  if (t.format === 'jpg') img = img.jpeg({ quality: 88, mozjpeg: true });
  else img = img.png({ compressionLevel: 9 });
  const buf = await img.toBuffer();
  writeFileSync(resolve(publicDir, t.out), buf);
  console.log(`OK  ${t.out}  (${buf.length} B)`);
}
