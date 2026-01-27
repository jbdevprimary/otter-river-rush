/**
 * Recovery Manager - Handles task recovery and matching logic
 * Prevents wasting API credits by finding existing Meshy tasks
 */

import chalk from 'chalk';
import { MeshyAPI } from '../meshy/index.js';

export interface CompletionStatus {
  completed: Set<string>; // Output paths that are complete
  inProgress: Map<string, string>; // Output path -> task ID
  alien: AlienTask[]; // Tasks in Meshy not from current manifests
}

interface MeshyTaskRecord {
  id: string;
  status: string;
  progress?: number;
  prompt?: string;
  created_at?: number | string;
  model_urls?: { glb?: string };
}

interface AlienTask {
  id: string;
  status: string;
  progress?: number;
  prompt?: string;
  glbFilename: string;
}

interface DuplicateTask {
  id: string;
  outputPath: string;
  prompt?: string;
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
      const tasks = (await this.meshyApi.getRecentTasks(
        expectedModels.length
      )) as MeshyTaskRecord[];
      if (!tasks || tasks.length === 0) {
        console.log(chalk.yellow('⚠️  No tasks found in Meshy API'));
        return status;
      }

      console.log(chalk.cyan(`📊 Found ${tasks.length} tasks in Meshy\n`));

      const processedOutputs = new Set<string>();
      const summary = {
        matched: 0,
        inProgress: 0,
        duplicates: 0,
        duplicateTasks: [] as DuplicateTask[],
        alienTasks: [] as AlienTask[],
      };

      const sortedTasks = sortTasksByCreatedAt(tasks);
      for (const task of sortedTasks) {
        this.processTask(task, expectedModels, processedOutputs, status, summary);
      }

      status.alien.push(...summary.alienTasks);
      this.printSummary(status, summary);

      if (summary.duplicateTasks.length > 0 && summary.duplicateTasks.length < 20) {
        await this.cleanupDuplicates(summary.duplicateTasks);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.log(chalk.yellow(`⚠️  Could not complete recovery: ${message}`));
      console.log(chalk.gray(`   Continuing with local state only...`));
    }

    return status;
  }

  private processTask(
    task: MeshyTaskRecord,
    expectedModels: string[],
    processedOutputs: Set<string>,
    status: CompletionStatus,
    summary: {
      matched: number;
      inProgress: number;
      duplicates: number;
      duplicateTasks: DuplicateTask[];
      alienTasks: AlienTask[];
    }
  ): void {
    if (!task.model_urls?.glb) return;

    const matchedModel = this.matchTaskToModel(task, expectedModels);
    if (!matchedModel) {
      summary.alienTasks.push({
        id: task.id,
        status: task.status,
        progress: task.progress,
        prompt: task.prompt,
        glbFilename: MeshyAPI.extractFilenameFromGLBURL(task.model_urls.glb),
      });
      return;
    }

    if (processedOutputs.has(matchedModel)) {
      summary.duplicates++;
      if (task.status === 'SUCCEEDED') {
        summary.duplicateTasks.push({
          id: task.id,
          outputPath: matchedModel,
          prompt: task.prompt,
        });
      }
      return;
    }

    summary.matched++;
    processedOutputs.add(matchedModel);

    this.applyTaskStatus(task, matchedModel, status, summary);
  }

  private applyTaskStatus(
    task: MeshyTaskRecord,
    matchedModel: string,
    status: CompletionStatus,
    summary: { inProgress: number }
  ): void {
    switch (task.status) {
      case 'SUCCEEDED':
        status.completed.add(matchedModel);
        console.log(chalk.green(`  ✅ Found: ${matchedModel}`));
        return;
      case 'IN_PROGRESS':
      case 'PENDING':
        summary.inProgress++;
        status.inProgress.set(matchedModel, task.id);
        console.log(chalk.yellow(`  ⏳ In progress: ${matchedModel} (${task.progress ?? 0}%)`));
        return;
      case 'FAILED':
      case 'EXPIRED':
        console.log(chalk.red(`  ❌ Failed: ${matchedModel} (${task.status})`));
        return;
      default:
        return;
    }
  }

  private printSummary(
    status: CompletionStatus,
    summary: {
      matched: number;
      inProgress: number;
      duplicates: number;
      duplicateTasks: DuplicateTask[];
      alienTasks: AlienTask[];
    }
  ): void {
    console.log(chalk.cyan(`\n📊 Recovery Summary:`));
    console.log(
      chalk.gray(`  🔗 Matched: ${summary.matched} unique tasks (${summary.duplicates} duplicates)`)
    );
    console.log(chalk.gray(`  📥 Completed: ${status.completed.size}`));
    console.log(chalk.gray(`  ⏳ In Progress: ${summary.inProgress}`));
    console.log(chalk.gray(`  👽 Alien Tasks: ${summary.alienTasks.length}`));
    console.log(chalk.gray(`  🔁 Duplicate Tasks: ${summary.duplicateTasks.length}\n`));
  }

  /**
   * Match Meshy task to expected model by prompt similarity
   */
  private matchTaskToModel(task: MeshyTaskRecord, expectedModels: string[]): string | null {
    const taskPrompt = (task.prompt || '').toLowerCase();

    for (const model of expectedModels) {
      const modelName = model.toLowerCase();
      if (matchesOtter(taskPrompt, modelName)) return model;
      if (matchesRock(taskPrompt, modelName)) return model;
      if (matchesCoin(taskPrompt, modelName)) return model;
      if (matchesGem(taskPrompt, modelName)) return model;
    }

    return null;
  }

  /**
   * Clean up duplicate tasks
   */
  private async cleanupDuplicates(duplicateTasks: DuplicateTask[]): Promise<void> {
    console.log(chalk.cyan(`\n🧹 Cleaning up ${duplicateTasks.length} duplicate tasks...\n`));
    let cleanedCount = 0;

    for (const dup of duplicateTasks) {
      try {
        await this.meshyApi.deleteTask(dup.id);
        cleanedCount++;
        console.log(chalk.gray(`  🗑️  Deleted ${dup.id.substring(0, 12)}`));
      } catch (_error) {
        // Ignore cleanup errors
      }
    }

    console.log(chalk.green(`\n✅ Cleaned ${cleanedCount} duplicate tasks\n`));
  }
}

function matchesOtter(prompt: string, modelName: string): boolean {
  return prompt.includes('otter') && modelName.includes('otter');
}

function matchesRock(prompt: string, modelName: string): boolean {
  if (!prompt.includes('rock') || !modelName.includes('rock')) return false;
  if (prompt.includes('moss') && modelName.includes('mossy')) return true;
  if (prompt.includes('crack') && modelName.includes('crack')) return true;
  if (prompt.includes('crystal') && modelName.includes('crystal')) return true;
  const isPlainRock =
    !prompt.includes('moss') && !prompt.includes('crack') && !prompt.includes('crystal');
  return isPlainRock && modelName === 'rock-river.glb';
}

function matchesCoin(prompt: string, modelName: string): boolean {
  return prompt.includes('coin') && modelName.includes('coin');
}

function matchesGem(prompt: string, modelName: string): boolean {
  if (!prompt.includes('gem') && !prompt.includes('gemstone')) return false;
  if (prompt.includes('blue') && modelName.includes('blue')) return true;
  if ((prompt.includes('red') || prompt.includes('ruby')) && modelName.includes('red')) {
    return true;
  }
  return false;
}
