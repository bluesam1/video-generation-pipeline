import fs from 'fs/promises';
import path from 'path';

/**
 * Save data as JSON to a file
 * @param {string} filepath - Path to the output file
 * @param {any} data - Data to save
 */
export async function saveJson(filepath, data) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filepath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write JSON with pretty formatting
    await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✓ Saved: ${filepath}`);
  } catch (error) {
    console.error(`✗ Error saving ${filepath}:`, error.message);
    throw error;
  }
}

/**
 * Read JSON from a file
 * @param {string} filepath - Path to the input file
 * @returns {Promise<any>} Parsed JSON data
 */
export async function readJson(filepath) {
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`✗ Error reading ${filepath}:`, error.message);
    throw error;
  }
}

/**
 * Check if a file exists
 * @param {string} filepath - Path to check
 * @returns {Promise<boolean>} True if file exists
 */
export async function fileExists(filepath) {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure a directory exists
 * @param {string} dirpath - Directory path
 */
export async function ensureDir(dirpath) {
  await fs.mkdir(dirpath, { recursive: true });
}

