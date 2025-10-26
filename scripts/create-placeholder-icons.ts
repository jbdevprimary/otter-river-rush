#!/usr/bin/env node
/**
 * Quick PWA Icon Generator - Creates placeholder icons from existing sprites
 */

import { copyFileSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public');
const SPRITES_DIR = join(PUBLIC_DIR, 'sprites');

function createSVGIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e3a8a;stop-opacity:1" />
    </radialGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="url(#bg)"/>
  <g transform="translate(50,50)">
    <!-- Otter ears -->
    <ellipse cx="-20" cy="-20" rx="10" ry="12" fill="#8B4513"/>
    <ellipse cx="20" cy="-20" rx="10" ry="12" fill="#8B4513"/>
    
    <!-- Otter head -->
    <circle cx="0" cy="0" r="22" fill="#A0522D"/>
    
    <!-- Eyes -->
    <circle cx="-8" cy="-5" r="4" fill="white"/>
    <circle cx="8" cy="-5" r="4" fill="white"/>
    <circle cx="-8" cy="-5" r="2" fill="black"/>
    <circle cx="8" cy="-5" r="2" fill="black"/>
    
    <!-- Nose -->
    <ellipse cx="0" cy="3" rx="5" ry="4" fill="#654321"/>
    
    <!-- Smile -->
    <path d="M -6,6 Q 0,10 6,6" stroke="#654321" stroke-width="2" fill="none" stroke-linecap="round"/>
    
    <!-- Whiskers -->
    <line x1="-22" y1="0" x2="-35" y2="-2" stroke="#654321" stroke-width="1"/>
    <line x1="-22" y1="3" x2="-35" y2="5" stroke="#654321" stroke-width="1"/>
    <line x1="22" y1="0" x2="35" y2="-2" stroke="#654321" stroke-width="1"/>
    <line x1="22" y1="3" x2="35" y2="5" stroke="#654321" stroke-width="1"/>
  </g>
</svg>`;
}

function createFaviconICO(): Buffer {
  // Create a minimal valid ICO file with 16x16 and 32x32 images
  // This is a simplified version - in production you'd use a proper library
  
  // For now, create a simple colored square
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);  // Reserved
  header.writeUInt16LE(1, 2);  // Type: 1 = ICO
  header.writeUInt16LE(1, 4);  // Number of images
  
  // Image directory entry for 32x32
  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(32, 0);   // Width
  dirEntry.writeUInt8(32, 1);   // Height
  dirEntry.writeUInt8(0, 2);    // Colors (0 = >256)
  dirEntry.writeUInt8(0, 3);    // Reserved
  dirEntry.writeUInt16LE(1, 4); // Color planes
  dirEntry.writeUInt16LE(32, 6); // Bits per pixel
  
  // Create a simple BMP data (32x32, blue)
  const bmpSize = 40 + (32 * 32 * 4); // Header + RGBA data
  const bmpData = Buffer.alloc(bmpSize);
  
  // BMP header
  bmpData.writeUInt32LE(40, 0);     // Header size
  bmpData.writeInt32LE(32, 4);      // Width
  bmpData.writeInt32LE(64, 8);      // Height (2x for ICO format)
  bmpData.writeUInt16LE(1, 12);     // Planes
  bmpData.writeUInt16LE(32, 14);    // Bits per pixel
  bmpData.writeUInt32LE(0, 16);     // Compression
  bmpData.writeUInt32LE(bmpSize - 40, 20); // Image size
  
  // Fill with blue color (#1e3a8a) and full opacity
  for (let i = 40; i < bmpSize; i += 4) {
    bmpData[i] = 138;     // B
    bmpData[i + 1] = 58;  // G
    bmpData[i + 2] = 30;  // R
    bmpData[i + 3] = 255; // A
  }
  
  dirEntry.writeUInt32LE(bmpSize, 8);  // Size of image data
  dirEntry.writeUInt32LE(22, 12);       // Offset to image data
  
  return Buffer.concat([header, dirEntry, bmpData]);
}

async function main() {
  console.log('🚀 Creating placeholder PWA icons...\n');
  
  // Check if we can use the otter sprite as a base
  const otterSprite = join(SPRITES_DIR, 'otter.png');
  
  if (existsSync(otterSprite)) {
    console.log('📋 Using otter sprite as icon base...');
    
    // Copy otter sprite for various icon sizes
    try {
      copyFileSync(otterSprite, join(PUBLIC_DIR, 'pwa-192x192.png'));
      console.log('✅ Created pwa-192x192.png');
      
      copyFileSync(otterSprite, join(PUBLIC_DIR, 'pwa-512x512.png'));
      console.log('✅ Created pwa-512x512.png');
      
      copyFileSync(otterSprite, join(PUBLIC_DIR, 'apple-touch-icon.png'));
      console.log('✅ Created apple-touch-icon.png');
    } catch (error) {
      console.error('❌ Error copying sprites:', error);
    }
  } else {
    console.log('⚠️  Otter sprite not found. Icons will need to be generated.');
    console.log('   Run: npm run generate-sprites');
  }
  
  // Create SVG mask icon
  console.log('\n🎨 Creating mask-icon.svg...');
  const svg = createSVGIcon();
  writeFileSync(join(PUBLIC_DIR, 'mask-icon.svg'), svg);
  console.log('✅ Created mask-icon.svg');
  
  // Create favicon.ico
  console.log('\n🎨 Creating favicon.ico...');
  const ico = createFaviconICO();
  writeFileSync(join(PUBLIC_DIR, 'favicon.ico'), ico);
  console.log('✅ Created favicon.ico');
  
  console.log('\n✨ Placeholder PWA icons created!');
  console.log('\n📝 Next steps:');
  console.log('   1. For better quality icons, run: npm run generate-pwa-icons');
  console.log('   2. Test the build: npm run build');
  console.log('   3. Test PWA installation on mobile devices');
}

main().catch(console.error);
