const sharp = require('sharp');
const path = require('path');

const baseDir = 'c:/Users/kenne/.gemini/antigravity/playground/silver-cassini/assets';

const mascotFiles = [
  'mascot-idle.png',
  'mascot-wave.png',
  'mascot-flex.png',
  'mascot-walk.png',
];

async function preciseClean(filename) {
  // Use the ORIGINAL backup version as source
  const originalPath = path.join(baseDir, filename.replace('.png', '-original.png'));
  const outputPath = path.join(baseDir, filename);
  
  console.log(`Processing ${filename} from original backup...`);

  const rawData = await sharp(originalPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(rawData.data);
  const w = rawData.info.width;
  const h = rawData.info.height;
  console.log(`  Size: ${w}x${h}`);

  // === PHASE 1: BFS flood fill from edges ===
  // Only mark pixels as background if they are truly white/very light gray
  // AND connected to the image border
  const isBackground = new Uint8Array(w * h).fill(0);
  const visited = new Uint8Array(w * h).fill(0);
  
  // BFS queue
  const queue = [];
  
  // Seed all border pixels
  for (let x = 0; x < w; x++) {
    seedIfWhite(x, 0);           // top
    seedIfWhite(x, h - 1);       // bottom
  }
  for (let y = 0; y < h; y++) {
    seedIfWhite(0, y);           // left
    seedIfWhite(w - 1, y);       // right
  }
  
  function seedIfWhite(x, y) {
    const idx = y * w + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    
    const pi = idx * 4;
    const r = pixels[pi], g = pixels[pi + 1], b = pixels[pi + 2], a = pixels[pi + 3];
    
    // Already transparent
    if (a < 20) {
      isBackground[idx] = 1;
      queue.push(idx);
      return;
    }
    
    // Check if this is a white/very light gray pixel
    // STRICT threshold to avoid eating character body
    const brightness = (r + g + b) / 3;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);
    
    if (brightness > 200 && saturation < 30) {
      isBackground[idx] = 1;
      queue.push(idx);
    }
  }
  
  // BFS flood fill
  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    const x = idx % w;
    const y = Math.floor(idx / w);
    
    // Visit 4-connected neighbors
    const neighbors = [
      { nx: x - 1, ny: y },
      { nx: x + 1, ny: y },
      { nx: x, ny: y - 1 },
      { nx: x, ny: y + 1 },
    ];
    
    for (const { nx, ny } of neighbors) {
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const nIdx = ny * w + nx;
      if (visited[nIdx]) continue;
      visited[nIdx] = 1;
      
      const pi = nIdx * 4;
      const r = pixels[pi], g = pixels[pi + 1], b = pixels[pi + 2], a = pixels[pi + 3];
      
      if (a < 20) {
        isBackground[nIdx] = 1;
        queue.push(nIdx);
        continue;
      }
      
      const brightness = (r + g + b) / 3;
      const saturation = Math.max(r, g, b) - Math.min(r, g, b);
      
      // STRICT: Only expand into very white/light gray areas
      // This avoids eating into the character body
      if (brightness > 195 && saturation < 35) {
        isBackground[nIdx] = 1;
        queue.push(nIdx);
      }
    }
  }
  
  console.log(`  Phase 1 BFS: ${queue.length} background pixels found`);
  
  // === PHASE 2: Apply transparency with smooth anti-aliased edges ===
  let removedCount = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const pi = idx * 4;
      
      if (isBackground[idx]) {
        // Check if near foreground for anti-aliasing
        let fgCount = 0;
        let total = 0;
        const radius = 3;
        
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
              total++;
              if (!isBackground[ny * w + nx]) fgCount++;
            }
          }
        }
        
        const fgRatio = fgCount / total;
        
        if (fgRatio > 0.55) {
          // Near edge of character - semi-transparent for smooth edges
          pixels[pi + 3] = Math.floor(fgRatio * 255);
        } else if (fgRatio > 0.2) {
          // Transition zone
          pixels[pi + 3] = Math.floor(fgRatio * 180);
        } else {
          // Far from character - fully transparent
          pixels[pi + 3] = 0;
        }
        removedCount++;
      }
    }
  }
  
  console.log(`  Phase 2: Applied transparency to ${removedCount} pixels`);

  // Save result
  await sharp(Buffer.from(pixels), {
    raw: { width: w, height: h, channels: 4 },
  })
    .png({ compressionLevel: 6 })
    .toFile(outputPath);

  console.log(`  Saved ${filename}`);
}

async function main() {
  for (const file of mascotFiles) {
    await preciseClean(file);
  }
  console.log('\nDone! All mascot backgrounds precisely cleaned.');
}

main().catch(console.error);
