import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';
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

/**
 * Generate scenes for the chosen ad concept using OpenAI
 * @param {AdConcept} chosenConcept - The selected ad concept
 * @param {UserInputs} userInputs - User's input data
 * @returns {Promise<Scene[]>} Array of scene objects
 */
export async function generateScenesForConcept(chosenConcept, userInputs) {
  const charactersDesc = chosenConcept.keyCharacters
    .map(c => `- ${c.name} (${c.role}): ${c.description}`)
    .join('\n');
  
  const objectsDesc = chosenConcept.keyObjects
    .map(o => `- ${o.name}: ${o.description}`)
    .join('\n');

  const prompt = `You are a script writer for funny ads. Create a scene-by-scene breakdown for this ad concept:

CONCEPT: ${chosenConcept.title}
${chosenConcept.highLevelDescription}

AVAILABLE CHARACTERS:
${charactersDesc}

AVAILABLE OBJECTS:
${objectsDesc}

TARGET AUDIENCE: ${userInputs.targetAudience}
PLATFORM: ${userInputs.platform}
BRAND GUIDELINES: ${userInputs.brandGuidelines}
HUMOR STYLE: ${userInputs.humorStyle}

Create 3-5 scenes that tell this funny ad story. For each scene:

STRICT REQUIREMENTS:
1. estimatedLengthSeconds: MUST be between 2 and 8 seconds (inclusive)
2. Total characters + objects: MUST NOT exceed 3 per scene
3. settingDescription: Clear visual description of location/time
4. sceneDescriptionWithDialog: Narrative of what happens, max 400 words
   - Include dialog for UP TO 1 character only
   - Describe visual actions clearly
5. Use ONLY characters and objects from the lists above

The scenes should:
- Flow together to create a coherent, funny ad
- Build up to a punchline or satisfying conclusion
- Show the product/service naturally
- Match the ${userInputs.humorStyle} humor style
- Be suitable for ${userInputs.platform}

Return ONLY valid JSON in this exact format:
{
  "scenes": [
    {
      "title": "Scene Title",
      "estimatedLengthSeconds": 5,
      "characterIds": ["character-name-1"],
      "objectIds": ["object-name-1"],
      "settingDescription": "Description of where/when this takes place",
      "sceneDescriptionWithDialog": "What happens in this scene, including any dialog..."
    }
  ]
}`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert script writer for viral advertising. You always respond with valid JSON only. You strictly follow scene requirements."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content;
    const data = JSON.parse(responseText);
    
    if (!data.scenes || !Array.isArray(data.scenes)) {
      throw new Error('Invalid response format: scenes array not found');
    }

    // Convert scene data to full Scene objects
    const scenes = data.scenes.map(scene => {
      // Map character and object IDs to full objects
      const sceneCharacters = (scene.characterIds || [])
        .map(name => chosenConcept.keyCharacters.find(c => 
          c.name.toLowerCase() === name.toLowerCase() || c.id === name
        ))
        .filter(Boolean);
      
      const sceneObjects = (scene.objectIds || [])
        .map(name => chosenConcept.keyObjects.find(o => 
          o.name.toLowerCase() === name.toLowerCase() || o.id === name
        ))
        .filter(Boolean);

      // Validate constraints
      if (scene.estimatedLengthSeconds < 2 || scene.estimatedLengthSeconds > 8) {
        console.warn(`⚠ Scene "${scene.title}" duration ${scene.estimatedLengthSeconds}s adjusted to valid range`);
        scene.estimatedLengthSeconds = Math.min(8, Math.max(2, scene.estimatedLengthSeconds));
      }

      const totalEntities = sceneCharacters.length + sceneObjects.length;
      if (totalEntities > 3) {
        console.warn(`⚠ Scene "${scene.title}" has ${totalEntities} entities, max is 3`);
      }

      return {
        id: uuidv4(),
        title: scene.title,
        estimatedLengthSeconds: scene.estimatedLengthSeconds,
        characters: sceneCharacters,
        objects: sceneObjects,
        settingDescription: scene.settingDescription,
        sceneDescriptionWithDialog: scene.sceneDescriptionWithDialog
      };
    });

    return scenes;
  } catch (error) {
    console.error('Error generating scenes:', error.message);
    throw error;
  }
}

