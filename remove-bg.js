const sharp = require('sharp');
const path = require('path');

async function cropLogoIcon() {
  const baseDir = 'c:/Users/kenne/.gemini/antigravity/playground/silver-cassini/assets';
  const inputPath = 'C:/Users/kenne/Downloads/WhatsApp Image 2026-02-23 at 2.48.35 PM (1).jpeg';
  
  const meta = await sharp(inputPath).metadata();
  console.log(`Logo source: ${meta.width}x${meta.height}`);
  
  // The icon takes up roughly the top 75% of the image (text is below)
  // And is centered horizontally with some padding
  const iconTop = Math.floor(meta.height * 0.03);
  const iconBottom = Math.floor(meta.height * 0.73);
  const iconLeft = Math.floor(meta.width * 0.08);
  const iconRight = Math.floor(meta.width * 0.92);
  
  const cropW = iconRight - iconLeft;
  const cropH = iconBottom - iconTop;
  
  // Crop just the circular icon, then process for transparency
  const rawData = await sharp(inputPath)
    .extract({ left: iconLeft, top: iconTop, width: cropW, height: cropH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const pixels = new Uint8Array(rawData.data);
  const w = rawData.info.width;
  const h = rawData.info.height;
  
  // Use circular mask + white removal
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) / 2 * 0.92;
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pi = (y * w + x) * 4;
      const r = pixels[pi];
      const g = pixels[pi + 1];
      const b = pixels[pi + 2];
      
      // Distance from center for circular crop
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Outside the circle = transparent
      if (dist > radius + 4) {
        pixels[pi + 3] = 0;
        continue;
      }
      
      // Anti-alias the edge of the circle
      if (dist > radius) {
        const edgeAlpha = Math.max(0, 1 - (dist - radius) / 4);
        pixels[pi + 3] = Math.floor(edgeAlpha * pixels[pi + 3]);
      }
      
      // Inside the circle - remove white background
      const brightness = (r + g + b) / 3;
      const saturation = Math.max(r, g, b) - Math.min(r, g, b);
      
      if (brightness > 230 && saturation < 25) {
        pixels[pi + 3] = 0;
      } else if (brightness > 210 && saturation < 35) {
        const alpha = Math.floor(((255 - brightness) / 45) * 255);
        pixels[pi + 3] = Math.min(pixels[pi + 3], alpha);
      }
    }
  }
  
  await sharp(Buffer.from(pixels), {
    raw: { width: w, height: h, channels: 4 }
  })
    .resize(200, 200, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(baseDir, 'logo-icon.png'));
  
  console.log('Logo icon cropped and saved!');
}

async function cleanMascotBg() {
  const baseDir = 'c:/Users/kenne/.gemini/antigravity/playground/silver-cassini/assets';
  const inputPath = 'C:/Users/kenne/Downloads/8BBD3A88-325A-4F90-A81B-2302C02B91B1.jpeg';
  
  const meta = await sharp(inputPath).metadata();
  console.log(`Mascot source: ${meta.width}x${meta.height}`);
  
  const rawData = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const pixels = new Uint8Array(rawData.data);
  const w = rawData.info.width;
  const h = rawData.info.height;
  
  // Multi-pass flood fill from 4 edges + corners
  const isBackground = new Uint8Array(w * h).fill(0);
  const seeds = [];
  
  // Seed from all 4 edges
  for (let x = 0; x < w; x++) {
    seeds.push(x); // top
    seeds.push((h - 1) * w + x); // bottom
  }
  for (let y = 0; y < h; y++) {
    seeds.push(y * w); // left
    seeds.push(y * w + (w - 1)); // right
  }
  
  // First, mark seed pixels that are light as background
  for (const idx of seeds) {
    const pi = idx * 4;
    const brightness = (pixels[pi] + pixels[pi + 1] + pixels[pi + 2]) / 3;
    if (brightness > 170) {
      isBackground[idx] = 1;
    }
  }
  
  // Multi-pass flood fill with increasing aggressiveness
  for (let pass = 0; pass < 20; pass++) {
    let changed = false;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        if (isBackground[idx]) continue;
        
        const pi = idx * 4;
        const r = pixels[pi];
        const g = pixels[pi + 1];
        const b = pixels[pi + 2];
        const brightness = (r + g + b) / 3;
        const saturation = Math.max(r, g, b) - Math.min(r, g, b);
        
        // More aggressive threshold for pixels near already-found background
        const isLight = brightness > 160 && saturation < 60;
        
        if (isLight) {
          const neighbors = [
            idx - 1, idx + 1, idx - w, idx + w,
            idx - w - 1, idx - w + 1, idx + w - 1, idx + w + 1
          ];
          
          let bgNeighborCount = 0;
          for (const n of neighbors) {
            if (n >= 0 && n < w * h && isBackground[n]) bgNeighborCount++;
          }
          
          if (bgNeighborCount >= 2) {
            isBackground[idx] = 1;
            changed = true;
          }
        }
      }
    }
    if (!changed) break;
  }
  
  // Apply with smooth edges
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const pi = idx * 4;
      
      if (isBackground[idx]) {
        // Edge detection for anti-aliasing
        let fgCount = 0;
        const r = 3;
        let total = 0;
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
              total++;
              if (!isBackground[ny * w + nx]) fgCount++;
            }
          }
        }
        
        const fgRatio = fgCount / total;
        if (fgRatio > 0.35) {
          pixels[pi + 3] = Math.floor(fgRatio * 200);
        } else {
          pixels[pi + 3] = 0;
        }
      }
    }
  }
  
  // Crop to content bounds (remove empty space)
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (pixels[(y * w + x) * 4 + 3] > 10) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  const padding = 10;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(w - 1, maxX + padding);
  maxY = Math.min(h - 1, maxY + padding);
  
  await sharp(Buffer.from(pixels), {
    raw: { width: w, height: h, channels: 4 }
  })
    .extract({ left: minX, top: minY, width: maxX - minX, height: maxY - minY })
    .png()
    .toFile(path.join(baseDir, 'mascot.png'));
  
  console.log(`Mascot cleaned! Cropped to ${maxX-minX}x${maxY-minY}`);
}

async function main() {
  await cropLogoIcon();
  await cleanMascotBg();
}

main().catch(console.error);
