import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';
import Replicate from 'replicate';
import crypto from 'crypto';

// Load .env file from the src directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Simple UUID v4 generator
function uuidv4() {
  return crypto.randomUUID();
}

// Lazy-load OpenAI client to ensure env vars are loaded
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set. Please check your .env file.');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

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
 * Generate start frames for each scene
 * @param {Scene[]} scenes - Array of scenes
 * @param {Object} referenceImages - Object with charactersWithImages and objectsWithImages
 * @param {UserInputs} userInputs - User inputs
 * @returns {Promise<SceneFrame[]>} Array of scene frames
 */
export async function generateSceneFrames(scenes, referenceImages, userInputs) {
  console.log(`\n🖼️  Generating scene start frames...`);
  console.log(`   Total scenes: ${scenes.length}`);

  const frames = [];

  for (const scene of scenes) {
    try {
      console.log(`\n   → Scene: ${scene.title}`);
      
      // Step 1: Generate frame description using OpenAI
      console.log(`      Generating frame description...`);
      const frameDescription = await generateFrameDescription(scene, userInputs);
      
      // Step 2: Collect reference image URLs for this scene
      const referenceImageUrls = [];
      
      for (const char of scene.characters) {
        const charWithImage = referenceImages.charactersWithImages.find(c => c.id === char.id);
        if (charWithImage?.referenceImageUrl) {
          referenceImageUrls.push(charWithImage.referenceImageUrl);
        }
      }
      
      for (const obj of scene.objects) {
        const objWithImage = referenceImages.objectsWithImages.find(o => o.id === obj.id);
        if (objWithImage?.referenceImageUrl) {
          referenceImageUrls.push(objWithImage.referenceImageUrl);
        }
      }
      
      // Limit to max 3 reference images
      const limitedReferenceUrls = referenceImageUrls.slice(0, 3);
      
      // Step 3: Generate the actual frame image using Replicate
      console.log(`      Generating frame image...`);
      const frameImageUrl = await generateFrameImage(
        frameDescription,
        scene.settingDescription,
        userInputs.brandGuidelines
      );
      
      const sceneFrame = {
        id: uuidv4(),
        sceneId: scene.id,
        description: frameDescription,
        referenceImageUrls: limitedReferenceUrls,
        frameImageUrl: frameImageUrl
      };
      
      frames.push(sceneFrame);
      console.log(`   ✓ Frame generated for: ${scene.title}`);
      
    } catch (error) {
      console.error(`   ✗ Failed to generate frame for ${scene.title}:`, error.message);
      // Add frame without image
      frames.push({
        id: uuidv4(),
        sceneId: scene.id,
        description: scene.settingDescription,
        referenceImageUrls: [],
        frameImageUrl: null
      });
    }
  }

  return frames;
}

/**
 * Generate a textual description of the first frame using OpenAI
 * @param {Scene} scene - The scene
 * @param {UserInputs} userInputs - User inputs
 * @returns {Promise<string>} Frame description
 */
async function generateFrameDescription(scene, userInputs) {
  const characterList = scene.characters.map(c => `${c.name} (${c.description})`).join(', ');
  const objectList = scene.objects.map(o => `${o.name} (${o.description})`).join(', ');

  const prompt = `You are a cinematographer describing the opening frame of a video scene.

SCENE: ${scene.title}
SETTING: ${scene.settingDescription}
CHARACTERS IN SCENE: ${characterList || 'None'}
OBJECTS IN SCENE: ${objectList || 'None'}
SCENE ACTION: ${scene.sceneDescriptionWithDialog.substring(0, 200)}...

Describe what the FIRST FRAME (the opening shot) of this scene should look like. Include:
- Camera angle and framing
- Character positions and expressions
- Object placement
- Lighting and mood
- Colors and visual style
- Composition

Keep it under 200 words. Be specific and visual. This will be used to generate an image.

Brand guidelines: ${userInputs.brandGuidelines}`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert cinematographer and visual director. You describe scenes in vivid, precise detail suitable for image generation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating frame description:', error.message);
    // Fallback to scene setting
    return scene.settingDescription;
  }
}

/**
 * Generate the actual frame image using Replicate
 * @param {string} frameDescription - Description of the frame
 * @param {string} setting - Scene setting
 * @param {string} brandGuidelines - Brand guidelines
 * @returns {Promise<string>} Image URL
 */
async function generateFrameImage(frameDescription, setting, brandGuidelines) {
  const prompt = `${frameDescription}
Setting: ${setting}
Style: Cinematic, high quality, professional video frame, commercial advertising aesthetic.
Brand guidelines: ${brandGuidelines}
9:16 aspect ratio, sharp focus, good lighting.`;

  try {
    const replicate = getReplicateClient();
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: prompt,
          num_outputs: 1,
          aspect_ratio: "9:16",
          output_format: "jpg",
          output_quality: 90
        }
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from Replicate');
    }

    return imageUrl;
  } catch (error) {
    console.error('Error generating frame image:', error.message);
    throw error;
  }
}

