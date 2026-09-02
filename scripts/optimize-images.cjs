/**
 * One-off / repeatable image optimizer for files in /public.
 * - Emits .webp siblings for the category hero images (PNG kept as fallback).
 * - Recompresses the oversized favicon / og-image PNGs in place.
 *
 * Requires sharp (not a runtime dep): `npm i -D sharp` before running,
 * then `node scripts/optimize-images.cjs`. The generated assets are
 * committed, so this only needs re-running when the source art changes.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUB = path.resolve(__dirname, '..', 'public');
const kb = (p) => (fs.statSync(p).size / 1024).toFixed(0) + 'KB';

const CATEGORY_IMAGES = ['household.png', 'home-living.png', 'health-beauty.png', 'kitchen.png'];

(async () => {
  for (const file of CATEGORY_IMAGES) {
    const src = path.join(PUB, file);
    if (!fs.existsSync(src)) continue;
    const out = src.replace(/\.png$/i, '.webp');
    await sharp(src).resize({ width: 900, withoutEnlargement: true }).webp({ quality: 72 }).toFile(out);
    console.log(`webp  ${file} -> ${path.basename(out)} (${kb(out)})`);
  }

  // Favicon ships at 1024px but is only ever rendered ~180px.
  const fav = path.join(PUB, 'favicon.png');
  if (fs.existsSync(fav)) {
    const before = kb(fav);
    await sharp(fav).resize({ width: 256 }).png({ quality: 80, compressionLevel: 9 }).toFile(fav + '.tmp');
    fs.renameSync(fav + '.tmp', fav);
    console.log(`png   favicon.png: ${before} -> ${kb(fav)}`);
  }

  // Social share image – recompress, keep 1024px dimensions.
  const og = path.join(PUB, 'og-image.png');
  if (fs.existsSync(og)) {
    const before = kb(og);
    await sharp(og).png({ quality: 75, compressionLevel: 9 }).toFile(og + '.tmp');
    fs.renameSync(og + '.tmp', og);
    console.log(`png   og-image.png: ${before} -> ${kb(og)}`);
  }

  console.log('done');
})();
