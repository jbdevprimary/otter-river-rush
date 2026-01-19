/**
 * Task Registry
 *
 * Loads and manages task definitions from JSON files.
 * Provides task lookup and dependency resolution.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TaskDefinition } from './types';

// ============================================================================
// REGISTRY
// ============================================================================

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = path.join(__dirname, 'definitions');

class TaskRegistry {
  private definitions: Map<string, TaskDefinition> = new Map();
  private loaded = false;

  /**
   * Load all task definitions from the definitions directory
   */
  load(): void {
    if (this.loaded) return;

    if (!fs.existsSync(DEFINITIONS_DIR)) {
      fs.mkdirSync(DEFINITIONS_DIR, { recursive: true });
      this.loaded = true;
      return;
    }

    const files = fs.readdirSync(DEFINITIONS_DIR).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(DEFINITIONS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const definition = JSON.parse(content) as TaskDefinition;

      this.definitions.set(definition.type, definition);
    }

    this.loaded = true;
  }

  /**
   * Get a task definition by type
   */
  get(type: string): TaskDefinition | undefined {
    this.load();
    return this.definitions.get(type);
  }

  /**
   * Get all registered task definitions
   */
  getAll(): TaskDefinition[] {
    this.load();
    return Array.from(this.definitions.values());
  }

  /**
   * Get task types in dependency order for a given end goal
   */
  getDependencyChain(targetType: string): string[] {
    this.load();

    const chain: string[] = [];
    const visited = new Set<string>();
    const inStack = new Set<string>();

    const visit = (type: string): void => {
      if (visited.has(type)) return;

      if (inStack.has(type)) {
        throw new Error(`Circular dependency detected involving task: ${type}`);
      }

      inStack.add(type);

      const def = this.definitions.get(type);
      if (!def) {
        throw new Error(`Unknown task type: ${type}`);
      }

      // Visit dependencies first
      for (const dep of def.dependsOn ?? []) {
        visit(dep);
      }

      inStack.delete(type);
      visited.add(type);
      chain.push(type);
    };

    visit(targetType);
    return chain;
  }

  /**
   * Register a task definition programmatically
   */
  register(definition: TaskDefinition): void {
    this.definitions.set(definition.type, definition);
  }
}

// Singleton instance
export const taskRegistry = new TaskRegistry();
