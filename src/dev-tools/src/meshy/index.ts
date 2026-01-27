/**
 * Meshy API - Modular Architecture
 *
 * Split into focused modules:
 * - text_to_3d: Text-to-3D generation (preview/refine)
 * - rigging: Character rigging and animations
 * - retexture: AI texture generation for variants
 *
 * This enables:
 * - Base tile generation (text_to_3d)
 * - Texture variants (retexture) - cheaper than full regeneration
 * - Character animations (rigging)
 */

import type { RequestInit, Response } from 'node-fetch';
import { AnimationsAPI } from './animations.js';
import type { RetextureTaskParams } from './retexture.js';
import { RetextureAPI } from './retexture.js';
import { RiggingAPI } from './rigging.js';
import type { CreateTaskParams, MeshyTask, RefineTaskParams } from './text_to_3d.js';
import { TextTo3DAPI } from './text_to_3d.js';

export * from './animations.js';
export * from './retexture.js';
export * from './rigging.js';
export * from './text_to_3d.js';

/**
 * Unified Meshy API with retry logic
 */
export class MeshyAPI {
  public text3d: TextTo3DAPI;
  public rigging: RiggingAPI;
  public retexture: RetextureAPI;
  public animations: AnimationsAPI;

  constructor(apiKey: string) {
    const v2Base = 'https://api.meshy.ai/openapi/v2';
    const _v1Base = 'https://api.meshy.ai/openapi/v1';

    this.text3d = new TextTo3DAPI(apiKey, v2Base);
    this.rigging = new RiggingAPI(apiKey);
    this.retexture = new RetextureAPI(apiKey);
    this.animations = new AnimationsAPI(apiKey);
  }

  /**
   * Shared retry logic for all API calls
   * Handles rate limits, server errors, retries
   */
  async makeRequestWithRetry(url: string, options: RequestInit, maxRetries = 5): Promise<unknown> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (response.ok) {
          return response.json();
        }

        const errorInfo = await parseMeshyError(response);
        const retryDelay = getRetryDelay(response.status, attempt, maxRetries);
        if (retryDelay !== null) {
          await wait(retryDelay, response.status, attempt + 1, maxRetries);
          continue;
        }

        throw new Error(formatMeshyError(response.status, errorInfo.message, errorInfo.raw));
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;

        const retryDelayMs = Math.min(1000 * 2 ** attempt, 60000);
        console.log(`   ⚠️  Request failed, retrying in ${retryDelayMs / 1000}s`);
        await wait(retryDelayMs);
      }
    }

    throw new Error(`Request failed after ${maxRetries} attempts`);
  }

  /**
   * Create preview task (uses text3d module)
   */
  async createPreviewTask(params: CreateTaskParams): Promise<MeshyTask> {
    return this.text3d.createPreviewTask(params, this.makeRequestWithRetry.bind(this));
  }

  /**
   * Create refine task (uses text3d module)
   */
  async createRefineTask(previewTaskId: string, params?: RefineTaskParams) {
    return this.text3d.createRefineTask(
      previewTaskId,
      this.makeRequestWithRetry.bind(this),
      params
    );
  }

  /**
   * Create rigging task (uses rigging module)
   */
  async createRiggingTask(refineTaskId: string) {
    return this.rigging.createRiggingTask({ input_task_id: refineTaskId });
  }

  /**
   * Create retexture task (uses retexture module)
   * THIS IS KEY FOR TILE VARIANTS
   */
  async createRetextureTask(params: RetextureTaskParams) {
    return this.retexture.createRetextureTask(params, this.makeRequestWithRetry.bind(this));
  }

  // Delegate other methods to appropriate modules
  async getTask(taskId: string, retryOn404 = true) {
    return this.text3d.getTask(taskId, retryOn404);
  }

  async getRiggingTask(taskId: string) {
    return this.rigging.getRiggingTask(taskId);
  }

  async getRetextureTask(taskId: string) {
    return this.retexture.getRetextureTask(taskId);
  }

  async pollTask(taskId: string, maxRetries?: number, intervalMs?: number) {
    return this.text3d.pollTask(taskId, maxRetries, intervalMs);
  }

  async pollRiggingTask(taskId: string, maxRetries?: number, intervalMs?: number) {
    return this.rigging.pollRiggingTask(taskId, maxRetries, intervalMs);
  }

  async pollRetextureTask(taskId: string, maxRetries?: number, intervalMs?: number) {
    return this.retexture.pollRetextureTask(taskId, maxRetries, intervalMs);
  }

  async listTasks(pageNum?: number, pageSize?: number) {
    return this.text3d.listTasks(pageNum, pageSize);
  }

  async deleteTask(taskId: string) {
    return this.text3d.deleteTask(taskId);
  }

  async deleteRiggingTask(taskId: string) {
    return this.rigging.deleteRiggingTask(taskId);
  }

  async deleteRetextureTask(taskId: string) {
    return this.retexture.deleteRetextureTask(taskId);
  }

  getAnimationUrls(task: MeshyTaskLike) {
    return this.rigging.getAnimationUrls(task);
  }

  getGLBUrl(task: MeshyTaskLike): string | null {
    if (task.model_urls?.glb) return task.model_urls.glb;
    if (task.model_url) return task.model_url;
    return null;
  }

  static extractFilenameFromGLBURL(glbURL: string): string {
    if (!glbURL) return '';
    const parts = glbURL.split('/');
    if (parts.length === 0) return '';
    let filename = parts[parts.length - 1];
    if (filename.endsWith('.glb')) {
      filename = filename.slice(0, -4);
    }
    return filename;
  }

  async getRecentTasks(estimatedJobCount: number = 600) {
    // Implementation for recovery manager
    const pageSize = 100;
    const tasksNeeded = Math.ceil(estimatedJobCount * 1.2);
    const maxPages = Math.ceil(tasksNeeded / pageSize);

    console.log(`📋 Need ~${estimatedJobCount} tasks, fetching up to ${maxPages} pages...`);

    const allTasks = await this.collectRecentTasks({
      maxPages,
      pageSize,
      tasksNeeded,
    });

    console.log(`📊 Fetched ${allTasks.length} recent tasks`);
    return allTasks;
  }

  private async collectRecentTasks({
    maxPages,
    pageSize,
    tasksNeeded,
  }: {
    maxPages: number;
    pageSize: number;
    tasksNeeded: number;
  }): Promise<MeshyTaskLike[]> {
    const allTasks: MeshyTaskLike[] = [];
    let pageNum = 1;

    while (pageNum <= maxPages) {
      const pageResult = await this.fetchTaskPage(pageNum, pageSize, allTasks);
      if (pageResult === 'stop') break;
      if (allTasks.length >= tasksNeeded) {
        console.log(`   ✓ Have enough tasks for matching`);
        break;
      }
      pageNum++;
      await wait(500);
    }

    return allTasks;
  }

  private async fetchTaskPage(
    pageNum: number,
    pageSize: number,
    allTasks: MeshyTaskLike[]
  ): Promise<'continue' | 'stop'> {
    try {
      const tasks = await this.listTasks(pageNum, pageSize);
      if (!Array.isArray(tasks) || tasks.length === 0) {
        return 'stop';
      }

      allTasks.push(...tasks);
      console.log(`   Page ${pageNum}: ${tasks.length} tasks (total: ${allTasks.length})`);

      if (tasks.length < pageSize) {
        return 'stop';
      }

      return 'continue';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`   ⚠️  Error on page ${pageNum}: ${message}`);
      if (allTasks.length > 0) {
        return 'stop';
      }
      throw error;
    }
  }
}

interface MeshyTaskLike {
  model_urls?: { glb?: string };
  model_url?: string;
  [key: string]: unknown;
}

async function parseMeshyError(response: Response): Promise<{ message?: string; raw: string }> {
  const raw = await response.text();
  try {
    const data = JSON.parse(raw) as { message?: string };
    return { message: data.message, raw };
  } catch {
    return { raw };
  }
}

function getRetryDelay(status: number, attempt: number, maxRetries: number): number | null {
  if (status === 429 || (status >= 500 && status <= 504)) {
    if (attempt >= maxRetries - 1) return null;
    return Math.min(1000 * 2 ** attempt, 60000);
  }
  return null;
}

function formatMeshyError(status: number, message: string | undefined, raw: string): string {
  const detail = message ?? raw;
  switch (status) {
    case 400:
      return `❌ Bad Request (400): ${detail || 'Invalid parameters'}`;
    case 401:
      return `❌ Unauthorized (401): ${detail || 'Invalid API key'}`;
    case 402:
      return `❌ Payment Required (402): ${detail || 'Insufficient funds'}`;
    case 403:
      return `❌ Forbidden (403): ${detail || 'Access forbidden'}`;
    case 404:
      return `❌ Not Found (404): ${detail || 'Resource not found'}`;
    default:
      return `❌ API Error (${status}): ${detail || raw}`;
  }
}

async function wait(
  delayMs: number,
  status?: number,
  attempt?: number,
  maxRetries?: number
): Promise<void> {
  if (status && attempt !== undefined && maxRetries !== undefined) {
    if (status === 429) {
      console.log(`   ⏳ Rate limited, waiting ${delayMs / 1000}s (${attempt}/${maxRetries})`);
    } else if (status >= 500 && status <= 504) {
      console.log(`   🔧 Server error (${status}), retrying in ${delayMs / 1000}s`);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
