const sharp = require('sharp');
const path = require('path');

async function cleanBg(inputPath, outputPath) {
  const meta = await sharp(inputPath).metadata();
  
  const rawData = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const pixels = new Uint8Array(rawData.data);
  const w = rawData.info.width;
  const h = rawData.info.height;
  
  const isBackground = new Uint8Array(w * h).fill(0);
  const seeds = [];
  
  for (let x = 0; x < w; x++) {
    seeds.push(x);
    seeds.push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    seeds.push(y * w);
    seeds.push(y * w + (w - 1));
  }
  
  for (const idx of seeds) {
    const pi = idx * 4;
    const brightness = (pixels[pi] + pixels[pi + 1] + pixels[pi + 2]) / 3;
    if (brightness > 170) isBackground[idx] = 1;
  }
  
  for (let pass = 0; pass < 20; pass++) {
    let changed = false;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        if (isBackground[idx]) continue;
        const pi = idx * 4;
        const brightness = (pixels[pi] + pixels[pi + 1] + pixels[pi + 2]) / 3;
        const saturation = Math.max(pixels[pi], pixels[pi + 1], pixels[pi + 2]) - Math.min(pixels[pi], pixels[pi + 1], pixels[pi + 2]);
        if (brightness > 160 && saturation < 60) {
          const neighbors = [idx - 1, idx + 1, idx - w, idx + w, idx - w - 1, idx - w + 1, idx + w - 1, idx + w + 1];
          let bgCount = 0;
          for (const n of neighbors) {
            if (n >= 0 && n < w * h && isBackground[n]) bgCount++;
          }
          if (bgCount >= 2) { isBackground[idx] = 1; changed = true; }
        }
      }
    }
    if (!changed) break;
  }
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const pi = idx * 4;
      if (isBackground[idx]) {
        let fgCount = 0, total = 0;
        for (let dy = -3; dy <= 3; dy++) {
          for (let dx = -3; dx <= 3; dx++) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
              total++;
              if (!isBackground[ny * w + nx]) fgCount++;
            }
          }
        }
        const fgRatio = fgCount / total;
        pixels[pi + 3] = fgRatio > 0.35 ? Math.floor(fgRatio * 200) : 0;
      }
    }
  }
  
  // Crop to content
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (pixels[(y * w + x) * 4 + 3] > 10) {
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      }
    }
  }
  
  const pad = 10;
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad); maxY = Math.min(h - 1, maxY + pad);
  
  await sharp(Buffer.from(pixels), { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: minX, top: minY, width: maxX - minX, height: maxY - minY })
    .resize(600, null, { fit: 'inside' })
    .png()
    .toFile(outputPath);
  
  console.log(`Done: ${path.basename(outputPath)}`);
}

async function main() {
  const baseDir = 'c:/Users/kenne/.gemini/antigravity/playground/silver-cassini/assets';
  const brainDir = 'C:/Users/kenne/.gemini/antigravity/brain/d4bf5d47-02d0-446a-88bf-120e4e2b06a0';
  
  await cleanBg(path.join(brainDir, 'mascot_pose_wave_1773944406420.png'), path.join(baseDir, 'mascot-wave.png'));
  await cleanBg(path.join(brainDir, 'mascot_pose_flex_1773944420591.png'), path.join(baseDir, 'mascot-flex.png'));
  await cleanBg(path.join(brainDir, 'mascot_pose_walk_1773944437381.png'), path.join(baseDir, 'mascot-walk.png'));
  
  // Also resize the main mascot to 600px
  await sharp(path.join(baseDir, 'mascot.png'))
    .resize(600, null, { fit: 'inside' })
    .png()
    .toFile(path.join(baseDir, 'mascot-idle.png'));
  console.log('Done: mascot-idle.png');
}

main().catch(console.error);
