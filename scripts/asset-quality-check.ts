#!/usr/bin/env node
/**
 * Quick Asset Quality Check - Just evaluates and reports, no fixes
 */

import { ASSET_MANIFEST } from './asset-manifest.js';
import { evaluateAllAssets, generateQualityReport } from './asset-quality-evaluator.js';

async function main() {
  console.log('\n🔍 Running Asset Quality Check...\n');
  
  const qualityResults = await evaluateAllAssets(ASSET_MANIFEST);
  generateQualityReport(ASSET_MANIFEST, qualityResults);
  
  const needsWork = Array.from(qualityResults.values())
    .filter(q => q.needsRegeneration).length;
  
  if (needsWork > 0) {
    console.log(`\n💡 To fix deficient assets, run: npm run asset-pipeline\n`);
    process.exit(1);
  } else {
    console.log(`\n✅ All assets pass quality checks!\n`);
    process.exit(0);
  }
}

main().catch(console.error);
