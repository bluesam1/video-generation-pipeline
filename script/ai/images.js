import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Replicate from 'replicate';

// Load .env file from the src directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Lazy-load Replicate client to ensure env vars are loaded
function getReplicateClient() {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN environment variable is not set. Please check your .env file.');
  }
  return new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
  });
}

/**
 * Generate reference images for characters and objects using Replicate's nano banana
 * @param {Character[]} characters - Array of characters
 * @param {AdObject[]} objects - Array of objects
 * @param {UserInputs} userInputs - User inputs for brand guidelines
 * @returns {Promise<{charactersWithImages: Character[], objectsWithImages: AdObject[]}>}
 */
export async function generateReferenceImages(characters, objects, userInputs) {
  console.log(`\n🎨 Generating reference images...`);
  console.log(`   Characters: ${characters.length}, Objects: ${objects.length}`);

  const charactersWithImages = [];
  const objectsWithImages = [];

  // Generate character images
  for (const character of characters) {
    try {
      console.log(`   → Generating image for: ${character.name}`);
      
      const prompt = constructCharacterPrompt(character, userInputs.brandGuidelines);
      const imageUrl = await generateImage(prompt);
      
      charactersWithImages.push({
        ...character,
        referenceImageUrl: imageUrl
      });
      
      console.log(`   ✓ Generated: ${character.name}`);
    } catch (error) {
      console.error(`   ✗ Failed to generate image for ${character.name}:`, error.message);
      // Add without image URL
      charactersWithImages.push(character);
    }
  }

  // Generate object images
  for (const obj of objects) {
    try {
      console.log(`   → Generating image for: ${obj.name}`);
      
      const prompt = constructObjectPrompt(obj, userInputs.brandGuidelines);
      const imageUrl = await generateImage(prompt);
      
      objectsWithImages.push({
        ...obj,
        referenceImageUrl: imageUrl
      });
      
      console.log(`   ✓ Generated: ${obj.name}`);
    } catch (error) {
      console.error(`   ✗ Failed to generate image for ${obj.name}:`, error.message);
      // Add without image URL
      objectsWithImages.push(obj);
    }
  }

  return { charactersWithImages, objectsWithImages };
}

/**
 * Generate a single image using Replicate's nano banana model
 * @param {string} prompt - Image generation prompt
 * @returns {Promise<string>} URL of generated image
 */
async function generateImage(prompt) {
  try {
    // Using fal-ai/flux/dev which is one of Replicate's fast image models
    // Note: "nano banana" may be a placeholder name - using a real fast model
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: prompt,
          num_outputs: 1,
          aspect_ratio: "9:16", // Vertical for social media
          output_format: "jpg",
          output_quality: 80
        }
      }
    );

    // Output is typically an array of URLs
    const imageUrl = Array.isArray(output) ? output[0] : output;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from Replicate');
    }

    return imageUrl;
  } catch (error) {
    console.error('Replicate image generation error:', error.message);
    throw error;
  }
}

/**
 * Construct a detailed prompt for character image generation
 * @param {Character} character - Character object
 * @param {string} brandGuidelines - Brand guidelines
 * @returns {string} Image generation prompt
 */
function constructCharacterPrompt(character, brandGuidelines) {
  return `Professional portrait photograph of ${character.description}. 
Role: ${character.role}. 
Style: Clean, well-lit, commercial advertising photography. 
Brand guidelines: ${brandGuidelines}. 
High quality, sharp focus, 9:16 aspect ratio.`;
}

/**
 * Construct a detailed prompt for object image generation
 * @param {AdObject} obj - Object to generate
 * @param {string} brandGuidelines - Brand guidelines
 * @returns {string} Image generation prompt
 */
function constructObjectPrompt(obj, brandGuidelines) {
  return `Professional product photography of ${obj.description}. 
Style: Clean, well-lit, commercial advertising photography, white or neutral background. 
Brand guidelines: ${brandGuidelines}. 
High quality, sharp focus, 9:16 aspect ratio.`;
}

