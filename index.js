#!/usr/bin/env node

/**
 * Funny Ad Video Generator - CLI Entry Point
 * 
 * This application generates funny advertising videos using:
 * - OpenAI for text generation (concepts, scripts)
 * - Replicate for image generation (nano banana / Flux)
 * - Replicate for video generation (Veo 3.1 Fast)
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { runPipeline } from './pipeline.js';
import { error as logError } from './utils/logging.js';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the src directory
const envPath = join(__dirname, '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(`\n⚠️  Warning: Could not load .env file from ${envPath}`);
  console.error(`   Error: ${result.error.message}\n`);
}

/**
 * Validate required environment variables
 */
function validateEnvironment() {
  const required = ['OPENAI_API_KEY', 'REPLICATE_API_TOKEN'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:\n');
    missing.forEach(key => {
      console.error(`   - ${key}`);
    });
    console.error('\nPlease set these in your environment or create a .env file.');
    console.error('See .env.example for reference.\n');
    process.exit(1);
  }
}

/**
 * Main entry point
 */
async function main() {
  try {
    // Validate environment
    validateEnvironment();

    // Clear console for clean start (optional)
    // console.clear();

    // Run the pipeline
    await runPipeline();

    // Exit successfully
    process.exit(0);
  } catch (err) {
    logError(`Fatal error: ${err.message}`);
    console.error('\n', err.stack);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Run the application
main();

