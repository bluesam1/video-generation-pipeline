/**
 * Logging utilities for the CLI
 */

export function banner(text) {
  const line = '='.repeat(text.length + 4);
  console.log('\n' + line);
  console.log(`  ${text}  `);
  console.log(line + '\n');
}

export function step(currentStep, totalSteps, description) {
  console.log(`\n📍 Step ${currentStep}/${totalSteps}: ${description}`);
  console.log('-'.repeat(50));
}

export function working(message) {
  console.log(`⏳ ${message}...`);
}

export function success(message) {
  console.log(`✓ ${message}`);
}

export function error(message) {
  console.error(`✗ ${message}`);
}

export function info(message) {
  console.log(`ℹ ${message}`);
}

export function section(title) {
  console.log(`\n--- ${title} ---`);
}

