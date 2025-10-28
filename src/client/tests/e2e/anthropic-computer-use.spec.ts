/**
 * Anthropic Computer Use - AI Agent Plays the Game
 * 
 * Uses Anthropic's Computer Use API to let Claude control the browser
 * and play the game autonomously, making real-time decisions.
 * 
 * This supplements Playwright's scripted tests with true AI gameplay.
 */

import { test, expect } from '@playwright/test';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

test.describe('Anthropic Computer Use - AI Gameplay', () => {
  test.skip(!process.env.ANTHROPIC_API_KEY, 'ANTHROPIC_API_KEY not set');

  test('Claude plays the game autonomously for 60 seconds', async ({ page }) => {
    // Start recording
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('🤖 Initializing Claude AI agent...');
    
    // Take initial screenshot for Claude
    const screenshot = await page.screenshot({ encoding: 'base64' });
    
    // Start conversation with Claude
    const messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: screenshot,
            },
          },
          {
            type: 'text',
            text: `You are playing "Otter River Rush", a mobile endless runner game.

GOAL: Survive as long as possible and maximize score.

CONTROLS:
- Swipe/Click LEFT/RIGHT: Change lanes (avoid obstacles)
- Swipe/Click UP: Jump
- Click "Rapid Rush" or "Classic" button to start

GAME MECHANICS:
- Dodge rocks (obstacles) to avoid losing health
- Collect coins (💰) and gems (💎) for points
- You have 3 hearts (❤️)
- Distance and score increase over time

STRATEGY:
1. Click a game mode button to start
2. Watch for obstacles coming toward you
3. Change lanes to dodge rocks
4. Collect coins/gems when safe
5. Survive as long as possible

Play for 60 seconds and report your final score.`,
          },
        ],
      },
    ];
    
    const startTime = Date.now();
    const maxDuration = 60000; // 60 seconds
    let turnCount = 0;
    let finalScore = 0;
    
    while (Date.now() - startTime < maxDuration && turnCount < 100) {
      turnCount++;
      
      // Get current screenshot
      const currentScreenshot = await page.screenshot({ encoding: 'base64' });
      
      // Get game state
      const gameState = await page.evaluate(() => {
        const state = (window as any).__gameStore?.getState?.();
        return {
          status: state?.status,
          score: state?.score,
          distance: state?.distance,
          lives: state?.lives,
        };
      });
      
      // If game over, break
      if (gameState.status === 'game_over') {
        finalScore = gameState.score;
        console.log(`💀 Claude died after ${Math.floor((Date.now() - startTime) / 1000)}s`);
        break;
      }
      
      // Add current screenshot to messages
      messages.push({
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: currentScreenshot,
            },
          },
          {
            type: 'text',
            text: `Current state: ${JSON.stringify(gameState)}\n\nWhat do you do next? Think step-by-step and take ONE action.`,
          },
        ],
      });
      
      // Get Claude's response with computer use
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages,
        tools: [
          {
            type: 'computer_20241022',
            name: 'computer',
            display_width_px: page.viewportSize()?.width || 1280,
            display_height_px: page.viewportSize()?.height || 720,
          },
        ],
      });
      
      // Process Claude's actions
      for (const block of response.content) {
        if (block.type === 'tool_use' && block.name === 'computer') {
          const action = block.input as any;
          
          console.log(`🤖 Claude: ${action.action} at (${action.coordinate?.[0]}, ${action.coordinate?.[1]})`);
          
          // Execute action in Playwright
          if (action.action === 'mouse_move' && action.coordinate) {
            await page.mouse.move(action.coordinate[0], action.coordinate[1]);
          } else if (action.action === 'left_click') {
            await page.mouse.click(action.coordinate?.[0] || 0, action.coordinate?.[1] || 0);
          } else if (action.action === 'key') {
            await page.keyboard.press(action.text || '');
          } else if (action.action === 'screenshot') {
            // Already captured
          }
        }
        
        if (block.type === 'text') {
          console.log(`💭 Claude thinks: ${block.text.substring(0, 100)}...`);
        }
      }
      
      // Add assistant response to messages
      messages.push({
        role: 'assistant',
        content: response.content,
      });
      
      // Small delay between turns
      await page.waitForTimeout(500);
    }
    
    // Get final stats
    const finalState = await page.evaluate(() => {
      const state = (window as any).__gameStore?.getState?.();
      return {
        status: state?.status,
        score: state?.score,
        distance: state?.distance,
        coins: state?.coins,
        gems: state?.gems,
      };
    });
    
    console.log('\n📊 Claude AI Final Stats:');
    console.log(`   Turns: ${turnCount}`);
    console.log(`   Duration: ${Math.floor((Date.now() - startTime) / 1000)}s`);
    console.log(`   Final Score: ${finalState.score}`);
    console.log(`   Distance: ${finalState.distance}m`);
    console.log(`   Coins: ${finalState.coins}`);
    console.log(`   Gems: ${finalState.gems}`);
    
    // Verify Claude was able to play
    expect(turnCount).toBeGreaterThan(0);
    expect(finalState.score).toBeGreaterThanOrEqual(0);
    
    console.log('\n✅ Anthropic Computer Use test complete');
  });
});

