#!/usr/bin/env node
/**
 * Asset Pipeline Orchestrator
 * 
 * This is the main script that:
 * 1. Evaluates ALL asset quality
 * 2. Post-processes deficient assets
 * 3. Auto-regenerates assets that fail quality checks
 * 4. Verifies fixes worked
 * 
 * RUN THIS TO AUDIT AND FIX ALL ASSETS
 */

import { ASSET_MANIFEST } from './asset-manifest.js';
import { evaluateAllAssets, generateQualityReport } from './asset-quality-evaluator.js';
import { processDeficientAssets } from './asset-post-processor.js';

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🎨 OTTER RIVER RUSH - ASSET PIPELINE');
  console.log('='.repeat(80));
  console.log('\nThis pipeline will:');
  console.log('  1. Evaluate quality of all assets');
  console.log('  2. Detect transparency and background issues');
  console.log('  3. Fix deficient assets automatically');
  console.log('  4. Re-evaluate to verify fixes');
  console.log('');

  // Step 1: Initial Quality Evaluation
  console.log('\n' + '─'.repeat(80));
  console.log('STEP 1: Initial Quality Evaluation');
  console.log('─'.repeat(80));
  
  const initialQuality = await evaluateAllAssets(ASSET_MANIFEST);
  
  // Generate initial report
  generateQualityReport(ASSET_MANIFEST, initialQuality);

  // Step 2: Process Deficient Assets
  console.log('\n' + '─'.repeat(80));
  console.log('STEP 2: Processing Deficient Assets');
  console.log('─'.repeat(80));
  
  const deficientCount = Array.from(initialQuality.values())
    .filter(q => q.needsRegeneration).length;
  
  if (deficientCount === 0) {
    console.log('\n✅ All assets meet quality standards! No processing needed.');
  } else {
    console.log(`\n🔧 Processing ${deficientCount} deficient assets...`);
    await processDeficientAssets(ASSET_MANIFEST, initialQuality);
    
    // Step 3: Re-evaluate
    console.log('\n' + '─'.repeat(80));
    console.log('STEP 3: Post-Processing Quality Verification');
    console.log('─'.repeat(80));
    
    const finalQuality = await evaluateAllAssets(ASSET_MANIFEST);
    generateQualityReport(ASSET_MANIFEST, finalQuality);
    
    // Compare improvement
    const initialAvg = Array.from(initialQuality.values())
      .reduce((sum, q) => sum + q.qualityScore, 0) / ASSET_MANIFEST.length;
    const finalAvg = Array.from(finalQuality.values())
      .reduce((sum, q) => sum + q.qualityScore, 0) / ASSET_MANIFEST.length;
    
    console.log('\n' + '─'.repeat(80));
    console.log('📈 IMPROVEMENT SUMMARY');
    console.log('─'.repeat(80));
    console.log(`Initial Average Score: ${initialAvg.toFixed(1)}/100`);
    console.log(`Final Average Score: ${finalAvg.toFixed(1)}/100`);
    console.log(`Improvement: ${(finalAvg - initialAvg).toFixed(1)} points`);
    
    const stillDeficient = Array.from(finalQuality.values())
      .filter(q => q.needsRegeneration).length;
    
    if (stillDeficient > 0) {
      console.log(`\n⚠️  ${stillDeficient} assets still need attention`);
      console.log('These may require manual regeneration with AI tools:');
      
      ASSET_MANIFEST.forEach(asset => {
        const quality = finalQuality.get(asset.id);
        if (quality?.needsRegeneration) {
          console.log(`\n   ${asset.name}:`);
          console.log(`   Path: ${asset.path}`);
          console.log(`   Score: ${quality.qualityScore}/100`);
          console.log(`   Issues: ${quality.issues.join(', ')}`);
          if (asset.canBeGenerated && asset.aiPrompt) {
            console.log(`   Regenerate with: npm run generate-sprites --sprite "${asset.name}"`);
          }
        }
      });
    } else {
      console.log('\n🎉 All assets now meet quality standards!');
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✨ Asset Pipeline Complete');
  console.log('='.repeat(80) + '\n');
}

main().catch(console.error);
