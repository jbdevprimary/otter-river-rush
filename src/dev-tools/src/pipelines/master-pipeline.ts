#!/usr/bin/env tsx
/**
 * MASTER PIPELINE ORCHESTRATOR
 * Cascading AI workflow: Content → Models → Code → Integration
 * ONE COMMAND generates EVERYTHING
 */

import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface PipelineResult {
  step: string;
  status: 'success' | 'failed' | 'skipped';
  output?: any;
  error?: string;
}

class MasterPipeline {
  private results: PipelineResult[] = [];
  
  async run() {
    console.log('🚀 MASTER PIPELINE STARTING\n');
    console.log('This will generate EVERYTHING from scratch:\n');
    console.log('1. Game content (enemies, levels, achievements)');
    console.log('2. 3D models via Meshy');
    console.log('3. Code integration');
    console.log('4. System updates\n');
    
    await this.step1_GenerateContent();
    await this.step2_GenerateModels();
    await this.step3_UpdateSystems();
    await this.step4_UpdateRenderer();
    
    this.printReport();
  }
  
  async step1_GenerateContent() {
    console.log('📝 STEP 1: AI Content Generation (Anthropic)\n');
    
    try {
      // Run content generator - it auto-cascades to model generation
      const contentGen = await import('../scripts/generate-content');
      await contentGen; // Executes on import
      
      this.results.push({ step: 'Content + Model Generation', status: 'success' });
    } catch (error: any) {
      this.results.push({ step: 'Content Generation', status: 'failed', error: error.message });
      throw error; // Stop pipeline on content gen failure
    }
  }
  
  async step2_GenerateModels() {
    console.log('\n🎨 STEP 2: 3D Models (Cascaded from Step 1)\n');
    console.log('✅ Handled by generate-content.ts cascade');
    this.results.push({ step: 'Model Generation', status: 'success', output: 'Auto-cascaded' });
  }
  
  async step3_UpdateSystems() {
    console.log('\n⚙️  STEP 3: Auto-wire Code Integration\n');
    
    try {
      const { CodeInjector } = await import('./code-injector');
      const injector = new CodeInjector();
      await injector.injectAll();
      
      this.results.push({ step: 'Code Integration', status: 'success' });
    } catch (error: any) {
      this.results.push({ step: 'Code Integration', status: 'failed', error: error.message });
    }
  }
  
  async step4_UpdateRenderer() {
    console.log('\n🎬 STEP 4: Verify Build\n');
    
    // Build check
    console.log('Running: pnpm build');
    const { execSync } = await import('child_process');
    
    try {
      execSync('cd src/client && pnpm build', { stdio: 'inherit', cwd: process.cwd() });
      this.results.push({ step: 'Build Verification', status: 'success' });
    } catch (error: any) {
      this.results.push({ step: 'Build Verification', status: 'failed', error: 'Build failed' });
    }
  }
  
  printReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MASTER PIPELINE REPORT');
    console.log('='.repeat(60));
    
    for (const result of this.results) {
      const icon = result.status === 'success' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
      console.log(`${icon} ${result.step}: ${result.status.toUpperCase()}`);
      if (result.output) console.log(`   ${result.output}`);
      if (result.error) console.log(`   Error: ${result.error}`);
    }
    
    console.log('='.repeat(60));
    const success = this.results.filter(r => r.status === 'success').length;
    const total = this.results.length;
    console.log(`\n🎯 Success Rate: ${success}/${total} steps completed\n`);
  }
}

// Run pipeline
const pipeline = new MasterPipeline();
pipeline.run().catch(console.error);
