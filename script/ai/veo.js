import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
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
 * Generate videos for each scene using Replicate's Veo 3.1 Fast model
 * @param {Scene[]} scenes - Array of scenes
 * @param {SceneFrame[]} frames - Array of scene frames
 * @param {Object} referenceImages - Object with charactersWithImages and objectsWithImages
 * @returns {Promise<SceneVideo[]>} Array of scene videos
 */
export async function generateSceneVideosWithVeo(scenes, frames, referenceImages) {
  console.log(`\n🎬 Generating scene videos with Veo 3.1 Fast...`);
  console.log(`   Total scenes: ${scenes.length}`);
  console.log(`   ⚠️  This may take several minutes per scene...\n`);

  const sceneVideos = [];

  for (const scene of scenes) {
    try {
      console.log(`\n   → Scene ${scenes.indexOf(scene) + 1}/${scenes.length}: ${scene.title}`);
      console.log(`      Duration: ${scene.estimatedLengthSeconds}s`);
      
      // Find the corresponding frame
      const frame = frames.find(f => f.sceneId === scene.id);
      if (!frame) {
        throw new Error(`No frame found for scene ${scene.id}`);
      }

      // Build the Veo request
      const veoRequest = buildVeoRequest(scene, frame, referenceImages);
      
      console.log(`      Submitting to Replicate...`);
      
      // Call Replicate's Veo 3.1 Fast model
      const videoUrl = await generateVideoWithVeo(veoRequest);
      
      const sceneVideo = {
        id: uuidv4(),
        sceneId: scene.id,
        veoRequestJson: veoRequest,
        videoUrl: videoUrl
      };
      
      sceneVideos.push(sceneVideo);
      console.log(`   ✓ Video generated for: ${scene.title}`);
      console.log(`      URL: ${videoUrl}`);
      
    } catch (error) {
      console.error(`   ✗ Failed to generate video for ${scene.title}:`, error.message);
      // Add video entry without URL
      sceneVideos.push({
        id: uuidv4(),
        sceneId: scene.id,
        veoRequestJson: null,
        videoUrl: null
      });
    }
  }

  return sceneVideos;
}

/**
 * Build the request payload for Veo video generation
 * @param {Scene} scene - The scene
 * @param {SceneFrame} frame - The scene frame
 * @param {Object} referenceImages - Reference images
 * @returns {Object} Veo request payload
 */
function buildVeoRequest(scene, frame, referenceImages) {
  // Construct a concise prompt for Veo
  const prompt = `${scene.settingDescription}. ${scene.sceneDescriptionWithDialog.substring(0, 300)}`;
  
  // Collect reference images for this scene's characters and objects
  const refImages = [];
  
  for (const char of scene.characters) {
    const charWithImage = referenceImages.charactersWithImages.find(c => c.id === char.id);
    if (charWithImage?.referenceImageUrl) {
      refImages.push(charWithImage.referenceImageUrl);
    }
  }
  
  for (const obj of scene.objects) {
    const objWithImage = referenceImages.objectsWithImages.find(o => o.id === obj.id);
    if (objWithImage?.referenceImageUrl) {
      refImages.push(objWithImage.referenceImageUrl);
    }
  }

  return {
    prompt: prompt,
    duration_seconds: scene.estimatedLengthSeconds,
    start_frame_image: frame.frameImageUrl,
    reference_images: refImages,
    resolution: "1080x1920", // 9:16 for vertical video
    fps: 24
  };
}

/**
 * Generate video using Replicate's Veo model
 * @param {Object} veoRequest - Veo request payload
 * @returns {Promise<string>} Video URL
 */
async function generateVideoWithVeo(veoRequest) {
  try {
    const replicate = getReplicateClient();
    // Using Replicate's video generation model
    // Note: Veo 3.1 Fast is Google's model. On Replicate, we'll use an available video generation model
    // Update this to the actual Replicate model identifier when available
    
    const output = await replicate.run(
      "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
      {
        input: {
          video_length: "14_frames_with_svd",
          sizing_strategy: "maintain_aspect_ratio",
          frames_per_second: 6,
          motion_bucket_id: 127,
          cond_aug: 0.02,
          decoding_t: 14,
          input_image: veoRequest.start_frame_image
        }
      }
    );

    const videoUrl = Array.isArray(output) ? output[0] : output;
    
    if (!videoUrl) {
      throw new Error('No video URL returned from Replicate');
    }

    return videoUrl;
  } catch (error) {
    console.error('Replicate video generation error:', error.message);
    throw error;
  }
}

/**
 * Alternative: Generate video with a more advanced model if available
 * This is a placeholder for when Veo 3.1 Fast becomes available on Replicate
 */
async function generateVideoWithVeo31Fast(veoRequest) {
  // TODO: Update this when Veo 3.1 Fast is available on Replicate
  // For now, this would use the model identifier: "google/veo-3.1-fast" or similar
  
  try {
    const replicate = getReplicateClient();
    const output = await replicate.run(
      "google/veo-3.1-fast", // Placeholder - update when available
      {
        input: {
          prompt: veoRequest.prompt,
          duration: veoRequest.duration_seconds,
          first_frame: veoRequest.start_frame_image,
          reference_images: veoRequest.reference_images,
          resolution: veoRequest.resolution,
          fps: veoRequest.fps
        }
      }
    );

    return Array.isArray(output) ? output[0] : output;
  } catch (error) {
    console.error('Veo 3.1 Fast not available, falling back to alternative model');
    // Fall back to stable-video-diffusion
    return generateVideoWithVeo(veoRequest);
  }
}

