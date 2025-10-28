/**
 * Recovery Manager - Handles task recovery and matching logic
 * Prevents wasting API credits by finding existing Meshy tasks
 */

import { MeshyAPI } from '../meshy/index.js';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export interface CompletionStatus {
  completed: Set<string>;  // Output paths that are complete
  inProgress: Map<string, string>;  // Output path -> task ID
  alien: any[];  // Tasks in Meshy not from current manifests
}

export class RecoveryManager {
  private meshyApi: MeshyAPI;

  constructor(meshyApi: MeshyAPI) {
    this.meshyApi = meshyApi;
  }

  /**
   * Auto-recovery: Sync with Meshy API to determine completion status
   * Downloads existing tasks instead of regenerating!
   */
  async autoRecover(expectedModels: string[]): Promise<CompletionStatus> {
    const status: CompletionStatus = {
      completed: new Set(),
      inProgress: new Map(),
      alien: [],
    };

    console.log(chalk.cyan('\n🔄 AUTO-RECOVERY: Syncing with Meshy API...\n'));

    try {
      // Fetch recent tasks from Meshy
      const allTasks = await this.meshyApi.getRecentTasks(expectedModels.length);

      if (!allTasks || allTasks.length === 0) {
        console.log(chalk.yellow('⚠️  No tasks found in Meshy API'));
        return status;
      }

      console.log(chalk.cyan(`📊 Found ${allTasks.length} tasks in Meshy\n`));

      // Track stats
      let downloaded = 0;
      let matched = 0;
      let inProgress = 0;
      let duplicates = 0;
      const unmatchedTasks: any[] = [];
      const duplicateTasks: any[] = [];
      const processedOutputs = new Set<string>();

      // Sort tasks by created_at (oldest first)
      const sortedTasks = [...allTasks].sort((a, b) => {
        const timeA = typeof a.created_at === 'number' ? a.created_at : 
                      (a.created_at ? new Date(a.created_at).getTime() : 0);
        const timeB = typeof b.created_at === 'number' ? b.created_at : 
                      (b.created_at ? new Date(b.created_at).getTime() : 0);
        return timeA - timeB;
      });

      // Process each Meshy task
      for (const task of sortedTasks) {
        if (!task.model_urls?.glb) {
          continue;
        }

        // Try to match task to expected model
        const matchedModel = this.matchTaskToModel(task, expectedModels);

        if (!matchedModel) {
          unmatchedTasks.push({
            id: task.id,
            status: task.status,
            progress: task.progress,
            prompt: task.prompt,
            glbFilename: MeshyAPI.extractFilenameFromGLBURL(task.model_urls.glb)
          });
          continue;
        }

        // Check for duplicates
        if (processedOutputs.has(matchedModel)) {
          duplicates++;
          if (task.status === 'SUCCEEDED') {
            duplicateTasks.push({
              id: task.id,
              outputPath: matchedModel,
              prompt: task.prompt
            });
          }
          continue;
        }

        matched++;
        processedOutputs.add(matchedModel);

        // Handle based on status
        switch (task.status) {
          case 'SUCCEEDED':
            status.completed.add(matchedModel);
            console.log(chalk.green(`  ✅ Found: ${matchedModel}`));
            break;

          case 'IN_PROGRESS':
          case 'PENDING':
            inProgress++;
            status.inProgress.set(matchedModel, task.id);
            console.log(chalk.yellow(`  ⏳ In progress: ${matchedModel} (${task.progress}%)`));
            break;

          case 'FAILED':
          case 'EXPIRED':
            console.log(chalk.red(`  ❌ Failed: ${matchedModel} (${task.status})`));
            break;
        }
      }

      // Mark unmatched tasks as alien
      for (const task of unmatchedTasks) {
        status.alien.push(task);
      }

      // Summary
      console.log(chalk.cyan(`\n📊 Recovery Summary:`));
      console.log(chalk.gray(`  🔗 Matched: ${matched} unique tasks (${duplicates} duplicates)`));
      console.log(chalk.gray(`  📥 Completed: ${status.completed.size}`));
      console.log(chalk.gray(`  ⏳ In Progress: ${inProgress}`));
      console.log(chalk.gray(`  👽 Alien Tasks: ${status.alien.length}`));
      console.log(chalk.gray(`  🔁 Duplicate Tasks: ${duplicateTasks.length}\n`));

      // Clean up duplicates
      if (duplicateTasks.length > 0 && duplicateTasks.length < 20) {
        await this.cleanupDuplicates(duplicateTasks);
      }

    } catch (error: any) {
      console.log(chalk.yellow(`⚠️  Could not complete recovery: ${error.message}`));
      console.log(chalk.gray(`   Continuing with local state only...`));
    }

    return status;
  }

  /**
   * Match Meshy task to expected model by prompt similarity
   */
  private matchTaskToModel(task: any, expectedModels: string[]): string | null {
    const taskPrompt = (task.prompt || '').toLowerCase();
    
    for (const model of expectedModels) {
      const modelName = model.toLowerCase();
      
      // Match otter
      if (taskPrompt.includes('otter') && modelName.includes('otter')) {
        return model;
      }
      
      // Match rock
      if (taskPrompt.includes('rock') && modelName.includes('rock')) {
        if (taskPrompt.includes('moss') && modelName.includes('mossy')) return model;
        if (taskPrompt.includes('crack') && modelName.includes('crack')) return model;
        if (taskPrompt.includes('crystal') && modelName.includes('crystal')) return model;
        if (!taskPrompt.includes('moss') && !taskPrompt.includes('crack') && 
            !taskPrompt.includes('crystal') && modelName === 'rock-river.glb') {
          return model;
        }
      }
      
      // Match coin
      if (taskPrompt.includes('coin') && modelName.includes('coin')) {
        return model;
      }
      
      // Match gems
      if (taskPrompt.includes('gem') || taskPrompt.includes('gemstone')) {
        if (taskPrompt.includes('blue') && modelName.includes('blue')) return model;
        if ((taskPrompt.includes('red') || taskPrompt.includes('ruby')) && 
            modelName.includes('red')) return model;
      }
    }
    
    return null;
  }

  /**
   * Clean up duplicate tasks
   */
  private async cleanupDuplicates(duplicateTasks: any[]): Promise<void> {
    console.log(chalk.cyan(`\n🧹 Cleaning up ${duplicateTasks.length} duplicate tasks...\n`));
    let cleanedCount = 0;

    for (const dup of duplicateTasks) {
      try {
        await this.meshyApi.deleteTask(dup.id);
        cleanedCount++;
        console.log(chalk.gray(`  🗑️  Deleted ${dup.id.substring(0, 12)}`));
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    
    console.log(chalk.green(`\n✅ Cleaned ${cleanedCount} duplicate tasks\n`));
  }
}
