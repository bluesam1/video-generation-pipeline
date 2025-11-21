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
 * Generate 3 ad concepts using OpenAI
 * @param {UserInputs} userInputs - User's input data
 * @returns {Promise<AdConcept[]>} Array of 3 ad concepts
 */
export async function generateAdConcepts(userInputs) {
  const prompt = `You are a creative director for funny advertising. Generate exactly 3 unique ad concepts based on the following information:

Product/Service: ${userInputs.productDescription}
Target Audience: ${userInputs.targetAudience}
Platform: ${userInputs.platform}
Brand Guidelines: ${userInputs.brandGuidelines}
Humor Style: ${userInputs.humorStyle}

For each concept, create:
1. A catchy title
2. A high-level description (max 300 words) that explains the ad story and humor
3. 2-5 key characters with name, role, and visual/personality description
4. 2-5 key objects/props with name and visual description

Requirements:
- Each concept should align with the "${userInputs.humorStyle}" humor style
- Concepts should be suitable for ${userInputs.platform}
- Follow the brand guidelines provided
- Make the concepts funny, engaging, and memorable
- Ensure visual feasibility (can be produced as a video)

Return ONLY a valid JSON object with a "concepts" array containing exactly 3 concepts in this format:
{
  "concepts": [
    {
      "title": "Concept Title",
      "highLevelDescription": "Description of the ad concept...",
      "keyCharacters": [
        {
          "name": "Character Name",
          "role": "Their role in the ad",
          "description": "Visual and personality description"
        }
      ],
      "keyObjects": [
        {
          "name": "Object Name",
          "description": "Visual description"
        }
      ]
    }
  ]
}

IMPORTANT: Return valid JSON only, no markdown, no code blocks, just the raw JSON object.`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert creative director specializing in funny, viral advertising. You always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content;
    console.log('📝 Raw OpenAI response (first 500 chars):', responseText.substring(0, 500));
    
    let conceptsData;
    try {
      conceptsData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError.message);
      console.error('Response text:', responseText);
      throw new Error(`Failed to parse OpenAI response as JSON: ${parseError.message}`);
    }
    
    // Handle if response is wrapped in an object
    if (conceptsData && conceptsData.concepts) {
      conceptsData = conceptsData.concepts;
    }
    
    // If conceptsData is still an object with numeric keys, convert to array
    if (conceptsData && typeof conceptsData === 'object' && !Array.isArray(conceptsData)) {
      // Check if it's an object with array-like structure
      const keys = Object.keys(conceptsData);
      if (keys.length > 0 && keys.every(k => !isNaN(parseInt(k)))) {
        conceptsData = Object.values(conceptsData);
      }
    }
    
    // Ensure we have exactly 3 concepts
    if (!Array.isArray(conceptsData)) {
      console.error('❌ Response is not an array. Type:', typeof conceptsData);
      console.error('Response structure:', JSON.stringify(conceptsData, null, 2).substring(0, 1000));
      throw new Error(`Expected array of concepts, got ${typeof conceptsData}. Response keys: ${Object.keys(conceptsData || {}).join(', ')}`);
    }
    
    if (conceptsData.length !== 3) {
      console.warn(`⚠️  Expected 3 concepts, got ${conceptsData.length}. Using first 3 or padding...`);
      if (conceptsData.length > 3) {
        conceptsData = conceptsData.slice(0, 3);
      } else {
        throw new Error(`Expected 3 concepts, got ${conceptsData.length}. Please try again.`);
      }
    }

    // Add IDs to all entities
    const concepts = conceptsData.map(concept => ({
      id: uuidv4(),
      title: concept.title,
      highLevelDescription: concept.highLevelDescription,
      keyCharacters: concept.keyCharacters.map(char => ({
        id: uuidv4(),
        name: char.name,
        role: char.role,
        description: char.description
      })),
      keyObjects: concept.keyObjects.map(obj => ({
        id: uuidv4(),
        name: obj.name,
        description: obj.description
      }))
    }));

    return concepts;
  } catch (error) {
    console.error('Error generating concepts:', error.message);
    throw error;
  }
}

