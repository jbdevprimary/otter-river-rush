#!/usr/bin/env node
/**
 * Simple PWA Icon Generator - Creates placeholder icons using Canvas
 * This creates simple colored placeholders until AI-generated icons are ready
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public');

// Simple PNG generator without external dependencies
function createSimplePNG(width: number, height: number, color: { r: number, g: number, b: number }): Buffer {
  // Create a simple PNG manually
  // This function creates a minimal PNG with a solid color as its intended implementation
  // This is a minimal PNG with a solid color
  
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A  // PNG signature
  ]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0);  // chunk length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.writeUInt8(8, 16);  // bit depth
  ihdr.writeUInt8(2, 17);  // color type (RGB)
  ihdr.writeUInt8(0, 18);  // compression
  ihdr.writeUInt8(0, 19);  // filter
  ihdr.writeUInt8(0, 20);  // interlace
  
  // Calculate CRC for IHDR
  const ihdrCrc = calculateCRC(ihdr.slice(4, 21));
  ihdr.writeUInt32BE(ihdrCrc, 21);
  
  // IDAT chunk (compressed image data)
  const rowSize = width * 3 + 1;  // 3 bytes per pixel + filter byte
  const imageDataSize = rowSize * height;
  const imageData = Buffer.alloc(imageDataSize);
  
  // Fill with color
  for (let y = 0; y < height; y++) {
    imageData[y * rowSize] = 0;  // No filter
    for (let x = 0; x < width; x++) {
      const offset = y * rowSize + 1 + x * 3;
      imageData[offset] = color.r;
      imageData[offset + 1] = color.g;
      imageData[offset + 2] = color.b;
    }
  }
  
  // Simple deflate compression (uncompressed blocks)
  const compressed = deflateUncompressed(imageData);
  
  const idat = Buffer.alloc(12 + compressed.length);
  idat.writeUInt32BE(compressed.length, 0);
  idat.write('IDAT', 4);
  compressed.copy(idat, 8);
  const idatCrc = calculateCRC(idat.slice(4, 8 + compressed.length));
  idat.writeUInt32BE(idatCrc, 8 + compressed.length);
  
  // IEND chunk
  const iend = Buffer.from([
    0x00, 0x00, 0x00, 0x00,  // length
    0x49, 0x45, 0x4E, 0x44,  // IEND
    0xAE, 0x42, 0x60, 0x82   // CRC
  ]);
  
  return Buffer.concat([pngHeader, ihdr, idat, iend]);
}

function calculateCRC(buf: Buffer): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function deflateUncompressed(data: Buffer): Buffer {
  const maxBlockSize = 65535;
  const blocks: Buffer[] = [];
  
  for (let i = 0; i < data.length; i += maxBlockSize) {
    const blockSize = Math.min(maxBlockSize, data.length - i);
    const isLast = (i + blockSize >= data.length) ? 1 : 0;
    
    const blockHeader = Buffer.alloc(5);
    blockHeader[0] = isLast;
    blockHeader.writeUInt16LE(blockSize, 1);
    blockHeader.writeUInt16LE(~blockSize & 0xFFFF, 3);
    
    blocks.push(blockHeader);
    blocks.push(data.slice(i, i + blockSize));
  }
  
  return Buffer.concat(blocks);
}

function createSVGIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="#1e3a8a"/>
  <ellipse cx="35" cy="40" rx="4" ry="6" fill="white"/>
  <ellipse cx="65" cy="40" rx="4" ry="6" fill="white"/>
  <path d="M 30,55 Q 50,65 70,55" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
  <ellipse cx="25" cy="35" rx="8" ry="10" fill="#1e3a8a"/>
  <ellipse cx="75" cy="35" rx="8" ry="10" fill="#1e3a8a"/>
</svg>`;
}

async function main() {
  console.log('🚀 Creating placeholder PWA icons...\n');
  
  // Create a simple blue color for placeholders
  const blueColor = { r: 30, g: 58, b: 138 };  // #1e3a8a
  
  // Create icons
  const icons = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];
  
  for (const icon of icons) {
    console.log(`Creating ${icon.name}...`);
    const png = createSimplePNG(icon.size, icon.size, blueColor);
    writeFileSync(join(PUBLIC_DIR, icon.name), png);
    console.log(`✅ Created ${icon.name}`);
  }
  
  // Create SVG mask icon
  console.log('Creating mask-icon.svg...');
  writeFileSync(join(PUBLIC_DIR, 'mask-icon.svg'), createSVGIcon());
  console.log('✅ Created mask-icon.svg');
  
  // Create a simple 32x32 favicon
  console.log('Creating favicon.ico placeholder...');
  const favicon = createSimplePNG(32, 32, blueColor);
  writeFileSync(join(PUBLIC_DIR, 'favicon.png'), favicon);
  console.log('✅ Created favicon.png (rename to .ico or use as is)');
  
  console.log('\n✨ Placeholder PWA icons created!');
  console.log('\n📝 Note: These are simple placeholders.');
  console.log('   Run `npm run generate-pwa-icons` with OPENAI_API_KEY to generate AI icons.');
}

main().catch(console.error);
