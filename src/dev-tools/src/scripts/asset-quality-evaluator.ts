#!/usr/bin/env node

/**
 * Asset Quality Evaluator - Analyzes asset quality and detects issues
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import type { AssetDefinition, QualityMetrics } from './asset-manifest.js';

const ASSETS_DIR = join(process.cwd(), 'assets');

/**
 * Detect if an image has a white background instead of transparency
 */
async function detectWhiteBackground(buffer: Buffer): Promise<boolean> {
  const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });

  if (!info.channels || info.channels < 4) {
    return false; // No alpha channel
  }

  // Sample corners and edges to check for white opaque pixels
  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  const samplePoints = [
    [0, 0], // Top-left
    [width - 1, 0], // Top-right
    [0, height - 1], // Bottom-left
    [width - 1, height - 1], // Bottom-right
    [Math.floor(width / 2), 0], // Top-center
    [Math.floor(width / 2), height - 1], // Bottom-center
    [0, Math.floor(height / 2)], // Left-center
    [width - 1, Math.floor(height / 2)], // Right-center
  ];

  let whiteOpaqueCount = 0;

  for (const [x, y] of samplePoints) {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];

    // White pixel (RGB near 255) and fully opaque (A = 255)
    if (r > 250 && g > 250 && b > 250 && a === 255) {
      whiteOpaqueCount++;
    }
  }

  // If more than half of sample points are white and opaque, likely has white background
  return whiteOpaqueCount > samplePoints.length / 2;
}

/**
 * Check if image has any transparency
 */
async function hasTransparency(buffer: Buffer): Promise<boolean> {
  const stats = await sharp(buffer).stats();
  // The alpha channel is the 4th channel (index 3).
  // If it exists and its minimum value is less than 255, the image has transparency.
  return stats.channels.length > 3 && stats.channels[3].min < 255;
}

function buildMissingQuality(): QualityMetrics {
  return {
    fileSize: 0,
    fileSizeKB: 0,
    width: 0,
    height: 0,
    aspectRatio: 0,
    format: 'missing',
    hasTransparency: false,
    hasWhiteBackground: false,
    isDistorted: false,
    isUndersized: false,
    isOversized: false,
    qualityScore: 0,
    issues: ['File does not exist'],
    needsRegeneration: true,
  };
}

function buildErrorQuality(error: unknown): QualityMetrics {
  const message = error instanceof Error ? error.message : String(error);
  return {
    fileSize: 0,
    fileSizeKB: 0,
    width: 0,
    height: 0,
    aspectRatio: 0,
    format: 'error',
    hasTransparency: false,
    hasWhiteBackground: false,
    isDistorted: false,
    isUndersized: false,
    isOversized: false,
    qualityScore: 0,
    issues: [`Error reading file: ${message}`],
    needsRegeneration: true,
  };
}

interface AssetChecks {
  hasTransparency: boolean;
  hasWhiteBackground: boolean;
  isDistorted: boolean;
  isUndersized: boolean;
  isOversized: boolean;
  expectedAspectRatio: number;
}

function computeChecks(
  asset: AssetDefinition,
  width: number,
  height: number,
  fileSizeKB: number,
  hasTransparencyCheck: boolean,
  hasWhiteBackgroundCheck: boolean
): AssetChecks {
  const expectedAspectRatio = asset.expectedSize.width / asset.expectedSize.height;
  const aspectRatio = width / height;
  const aspectRatioTolerance = 0.05;
  return {
    hasTransparency: hasTransparencyCheck,
    hasWhiteBackground: hasWhiteBackgroundCheck,
    isDistorted: Math.abs(aspectRatio - expectedAspectRatio) > aspectRatioTolerance,
    isUndersized:
      width < asset.expectedSize.width * 0.8 || height < asset.expectedSize.height * 0.8,
    isOversized: fileSizeKB > asset.maxFileSizeKB,
    expectedAspectRatio,
  };
}

function collectIssues(
  asset: AssetDefinition,
  format: string,
  width: number,
  height: number,
  fileSizeKB: number,
  checks: AssetChecks,
  aspectRatio: number
): string[] {
  const issues: string[] = [];
  if (format !== asset.expectedFormat) {
    issues.push(`Wrong format: ${format} (expected ${asset.expectedFormat})`);
  }
  if (asset.requiresTransparency && !checks.hasTransparency) {
    issues.push('Missing transparency (should have transparent background)');
  }
  if (asset.requiresTransparency && checks.hasWhiteBackground) {
    issues.push('Has white background instead of transparency');
  }
  if (checks.isDistorted) {
    issues.push(
      `Distorted aspect ratio: ${aspectRatio.toFixed(2)} (expected ${checks.expectedAspectRatio.toFixed(2)})`
    );
  }
  if (checks.isUndersized) {
    issues.push(
      `Undersized: ${width}x${height} (expected ${asset.expectedSize.width}x${asset.expectedSize.height})`
    );
  }
  if (checks.isOversized) {
    issues.push(`File too large: ${fileSizeKB}KB (max ${asset.maxFileSizeKB}KB)`);
  }
  return issues;
}

function calculateQualityScore(
  asset: AssetDefinition,
  format: string,
  checks: AssetChecks
): number {
  let qualityScore = 100;
  if (format !== asset.expectedFormat) qualityScore -= 20;
  if (asset.requiresTransparency && !checks.hasTransparency) qualityScore -= 30;
  if (checks.hasWhiteBackground) qualityScore -= 25;
  if (checks.isDistorted) qualityScore -= 15;
  if (checks.isUndersized) qualityScore -= 20;
  if (checks.isOversized) qualityScore -= 10;
  return Math.max(0, qualityScore);
}

/**
 * Evaluate quality of a single asset
 */
export async function evaluateAssetQuality(asset: AssetDefinition): Promise<QualityMetrics> {
  const fullPath = join(ASSETS_DIR, asset.path);

  // Check if file exists
  if (!existsSync(fullPath)) {
    return buildMissingQuality();
  }

  try {
    // Read file
    const buffer = readFileSync(fullPath);
    const fileSize = buffer.length;
    const fileSizeKB = Math.round(fileSize / 1024);

    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const format = metadata.format || 'unknown';
    const aspectRatio = width / height;

    // Run quality checks
    const hasTransparencyCheck = await hasTransparency(buffer);
    const hasWhiteBackgroundCheck = await detectWhiteBackground(buffer);

    const checks = computeChecks(
      asset,
      width,
      height,
      fileSizeKB,
      hasTransparencyCheck,
      hasWhiteBackgroundCheck
    );
    const issues = collectIssues(asset, format, width, height, fileSizeKB, checks, aspectRatio);
    const qualityScore = calculateQualityScore(asset, format, checks);

    // Determine if regeneration is needed
    const needsRegeneration =
      qualityScore < 70 || (asset.requiresTransparency && checks.hasWhiteBackground);

    return {
      fileSize,
      fileSizeKB,
      width,
      height,
      aspectRatio,
      format,
      hasTransparency: checks.hasTransparency,
      hasWhiteBackground: checks.hasWhiteBackground,
      isDistorted: checks.isDistorted,
      isUndersized: checks.isUndersized,
      isOversized: checks.isOversized,
      qualityScore,
      issues,
      needsRegeneration,
    };
  } catch (error) {
    return buildErrorQuality(error);
  }
}

/**
 * Evaluate all assets in manifest
 */
export async function evaluateAllAssets(
  manifest: AssetDefinition[]
): Promise<Map<string, QualityMetrics>> {
  const results = new Map<string, QualityMetrics>();

  for (const asset of manifest) {
    console.log(`\n📊 Evaluating: ${asset.name}`);
    const quality = await evaluateAssetQuality(asset);
    results.set(asset.id, quality);
    printQualityResult(quality);
  }

  return results;
}

function printQualityResult(quality: QualityMetrics): void {
  const scoreEmoji = quality.qualityScore >= 90 ? '✅' : quality.qualityScore >= 70 ? '⚠️' : '❌';
  console.log(`   ${scoreEmoji} Quality Score: ${quality.qualityScore}/100`);
  console.log(`   📐 Size: ${quality.width}x${quality.height} (${quality.fileSizeKB}KB)`);
  console.log(`   🎨 Format: ${quality.format}`);
  console.log(`   🔍 Transparency: ${quality.hasTransparency ? 'Yes' : 'No'}`);

  if (quality.hasWhiteBackground) {
    console.log(`   🚨 WHITE BACKGROUND DETECTED (should be transparent)`);
  }

  if (quality.issues.length > 0) {
    console.log(`   ⚠️  Issues:`);
    for (const issue of quality.issues) {
      console.log(`      - ${issue}`);
    }
  }

  if (quality.needsRegeneration) {
    console.log(`   🔄 NEEDS REGENERATION`);
  }
}

/**
 * Generate summary report
 */
export function generateQualityReport(
  manifest: AssetDefinition[],
  qualityResults: Map<string, QualityMetrics>
): void {
  console.log(`\n\n${'='.repeat(80)}`);
  console.log('🎨 ASSET QUALITY REPORT');
  console.log('='.repeat(80));

  const totalAssets = manifest.length;
  const perfect = Array.from(qualityResults.values()).filter((q) => q.qualityScore === 100).length;
  const good = Array.from(qualityResults.values()).filter(
    (q) => q.qualityScore >= 70 && q.qualityScore < 100
  ).length;
  const poor = Array.from(qualityResults.values()).filter((q) => q.qualityScore < 70).length;
  const needRegeneration = Array.from(qualityResults.values()).filter(
    (q) => q.needsRegeneration
  ).length;

  console.log(`\n📊 Overall Statistics:`);
  console.log(`   Total Assets: ${totalAssets}`);
  console.log(`   ✅ Perfect (100): ${perfect}`);
  console.log(`   ⚠️  Good (70-99): ${good}`);
  console.log(`   ❌ Poor (<70): ${poor}`);
  console.log(`   🔄 Need Regeneration: ${needRegeneration}`);

  // Average quality score
  const avgScore =
    Array.from(qualityResults.values()).reduce((sum, q) => sum + q.qualityScore, 0) / totalAssets;
  console.log(`   📈 Average Quality Score: ${avgScore.toFixed(1)}/100`);

  // Assets by category
  console.log(`\n📁 By Category:`);
  const categories = ['sprite', 'hud', 'icon', 'pwa', 'ui'] as const;
  for (const category of categories) {
    const categoryAssets = manifest.filter((a) => a.category === category);
    const categoryScore =
      categoryAssets.reduce((sum, asset) => {
        const quality = qualityResults.get(asset.id);
        return sum + (quality?.qualityScore || 0);
      }, 0) / categoryAssets.length;

    console.log(
      `   ${category.padEnd(8)}: ${categoryScore.toFixed(1)}/100 (${categoryAssets.length} assets)`
    );
  }

  // Critical issues
  const whiteBackgrounds = Array.from(qualityResults.entries()).filter(
    ([_, q]) => q.hasWhiteBackground
  );
  const missingTransparency = Array.from(qualityResults.entries()).filter(([id, q]) => {
    const asset = manifest.find((a) => a.id === id);
    return asset?.requiresTransparency && !q.hasTransparency;
  });

  if (whiteBackgrounds.length > 0) {
    console.log(`\n🚨 CRITICAL: ${whiteBackgrounds.length} assets with WHITE BACKGROUNDS:`);
    whiteBackgrounds.forEach(([id, _]) => {
      const asset = manifest.find((a) => a.id === id);
      console.log(`   - ${asset?.name} (${asset?.path})`);
    });
  }

  if (missingTransparency.length > 0) {
    console.log(`\n⚠️  ${missingTransparency.length} assets missing required transparency:`);
    for (const [id] of missingTransparency) {
      const asset = manifest.find((a) => a.id === id);
      console.log(`   - ${asset?.name} (${asset?.path})`);
    }
  }

  // Assets needing regeneration
  if (needRegeneration > 0) {
    console.log(`\n🔄 ${needRegeneration} assets recommended for regeneration:`);
    for (const [id, q] of qualityResults.entries()) {
      if (!q.needsRegeneration) continue;
      const asset = manifest.find((a) => a.id === id);
      console.log(`   - ${asset?.name} (Score: ${q.qualityScore}/100)`);
      for (const issue of q.issues) {
        console.log(`     • ${issue}`);
      }
    }
  }

  console.log(`\n${'='.repeat(80)}`);
}
