import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCrcTable();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function writeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const toCrc = Buffer.alloc(4 + len);
  toCrc.write(type, 0, 4, 'ascii');
  data.copy(toCrc, 4);
  chunk.writeUInt32BE(crc32(toCrc), 8 + len);
  return chunk;
}

function generatePng(width, height) {
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  const cx = width / 2;
  const cy = height / 2;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: None
    const dy = (y - cy) / (height * 0.46);
    for (let x = 0; x < width; x++) {
      const dx = (x - cx) / (width * 0.46);
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);

      // Background: Deep obsidian gradient with subtle cyan ambient radial glow
      let r = 3;
      let g = 7;
      let b = 18;
      
      const radialGlow = Math.max(0, 1 - distFromCenter * 0.95);
      r += Math.round(radialGlow * 15);
      g += Math.round(radialGlow * 40);
      b += Math.round(radialGlow * 75);

      // Shield outline math:
      // A rounded shield: top flat/curved, tapered bottom
      const sx = Math.abs(dx) * 1.35;
      const sy = dy + 0.12;
      const inShield = (sy < 0.75) && (sy > -0.75) && (
        sy <= 0 ? (sx < 0.78) : (sx < (0.78 - (sy * 0.72) * (sy * 0.72)))
      );
      const shieldBorder = inShield && (
        (sy > 0 ? (sx > 0.78 - (sy * 0.72) * (sy * 0.72) - 0.08) : (sx > 0.70)) ||
        (sy > 0.67) || (sy < -0.67)
      );

      // Dumbbell Emblem math:
      // Central bar: horizontal
      const bar = (Math.abs(dy) < 0.07) && (Math.abs(dx) < 0.42);
      // Dumbbell plates:
      const leftPlateInner = (Math.abs(dx + 0.35) < 0.05) && (Math.abs(dy) < 0.28);
      const leftPlateOuter = (Math.abs(dx + 0.46) < 0.04) && (Math.abs(dy) < 0.22);
      const rightPlateInner = (Math.abs(dx - 0.35) < 0.05) && (Math.abs(dy) < 0.28);
      const rightPlateOuter = (Math.abs(dx - 0.46) < 0.04) && (Math.abs(dy) < 0.22);

      // Center core diamond / tech ring
      const diamondDist = Math.abs(dx) + Math.abs(dy);
      const centerDiamond = diamondDist < 0.16 && diamondDist > 0.09;
      const centerDot = (dx * dx + dy * dy) < 0.0025;

      const isDumbbell = bar || leftPlateInner || leftPlateOuter || rightPlateInner || rightPlateOuter;

      if (isDumbbell || centerDiamond || centerDot) {
        // Bright electric cyan to sapphire blue glow
        r = 6;
        g = 240;
        b = 255;
      } else if (shieldBorder) {
        // Glowing cyan shield border
        r = 14;
        g = 165;
        b = 233;
      } else if (inShield) {
        // Dark metallic inner shield fill
        r = Math.min(255, r + 10);
        g = Math.min(255, g + 24);
        b = Math.min(255, b + 48);
      }

      rawData[offset++] = Math.min(255, Math.max(0, r));
      rawData[offset++] = Math.min(255, Math.max(0, g));
      rawData[offset++] = Math.min(255, Math.max(0, b));
      rawData[offset++] = 255; // Alpha
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdrChunk = writeChunk('IHDR', ihdrData);
  const idatCompressed = zlib.deflateSync(rawData, { level: 6 });
  const idatChunk = writeChunk('IDAT', idatCompressed);
  const iendChunk = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pngBuffer = generatePng(1024, 1024);

fs.writeFileSync('public/icon.png', pngBuffer);
fs.writeFileSync('public/favicon.png', pngBuffer);

// Also create xcassets structure for iOS build
const xcassetsDir = path.join('ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');
fs.mkdirSync(xcassetsDir, { recursive: true });
fs.writeFileSync(path.join(xcassetsDir, 'AppIcon-512@2x.png'), pngBuffer);

const contentsJson = {
  images: [
    {
      filename: 'AppIcon-512@2x.png',
      idiom: 'universal',
      platform: 'ios',
      size: '1024x1024'
    }
  ],
  info: {
    author: 'xcode',
    version: 1
  }
};
fs.writeFileSync(path.join(xcassetsDir, 'Contents.json'), JSON.stringify(contentsJson, null, 2));

console.log('App icon generated successfully: public/icon.png and ios Assets.xcassets!');
