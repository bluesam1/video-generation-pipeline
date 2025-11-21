# Funny Ad Video Generator – Node.js CLI Script Spec

## 1. Goal

Implement a Node.js console application that walks a user through all phases of creating a funny ad video and outputs:

* Structured JSON files for:

  * User inputs
  * Ad concepts
  * Script scenes
  * Scene frames
  * Scene videos
* A final stitched video file path (from scene videos).

The script will orchestrate calls to:
* **OpenAI APIs** for all text generation (concepts, scenes, frame descriptions)
* **Replicate.com's nano banana model** for image generation (reference images and scene frames)
* **Replicate.com's Veo 3.1 Fast model** for video generation

All API calls are implemented via clearly separated helper functions.

---

## 2. Tech + Project Setup

**Assumptions**

* Node.js ≥ 18
* Use `npm` or `pnpm`.
* Use CommonJS **or** ES modules (Cursor can choose, but be consistent).
* Use a CLI prompt library, e.g. `inquirer`.

**Required dependencies**

```bash
npm install inquirer openai replicate
# Optional: dotenv for environment variable management
npm install dotenv
```

**API Keys Required**

The following environment variables must be set:
* `OPENAI_API_KEY` - Your OpenAI API key
* `REPLICATE_API_TOKEN` - Your Replicate API token

These can be set via:
* Environment variables in your shell
* A `.env` file (if using `dotenv`)
* Command-line arguments (optional enhancement)

**Project structure (suggested)**

```txt
project-root/
  src/
    index.js             # entry point (CLI)
    prompts.js           # all CLI prompt functions
    pipeline.js          # high-level orchestration
    ai/
      concepts.js        # generate 3 ad concepts
      script.js          # generate scenes for chosen concept
      images.js          # generate character/object reference images
      frames.js          # generate start frames per scene
      veo.js             # generate videos per scene via Veo JSON format
    utils/
      io.js              # read/write JSON, file paths, etc.
      logging.js         # logging helpers (optional)
  output/
    inputs.json
    concepts.json
    chosen-concept.json
    scenes.json
    reference-images.json
    scene-frames.json
    scene-videos.json
    final-video.mp4      # or URL/path
  package.json
  README.md
```

---

## 3. Data Models

Use these interfaces as the conceptual data shape (types are for clarity; actual code can be JS).

```ts
type HumorStyle =
  | "Escalating Disaster"
  | "Expectation Subversion"
  | "Relatable Awkward Moment";

interface UserInputs {
  productDescription: string;
  targetAudience: string;
  platform: string;
  brandGuidelines: string;
  humorStyle: HumorStyle;
}

interface AdConcept {
  id: string;
  title: string;
  highLevelDescription: string; // <= 300 words
  keyCharacters: Character[];
  keyObjects: AdObject[];
}

interface Character {
  id: string;
  name: string;
  role: string;          // ex: "awkward main hero", "overly serious narrator"
  description: string;   // visual/personality notes
  referenceImageUrl?: string;
}

interface AdObject {
  id: string;
  name: string;          // ex: "overloaded shopping cart"
  description: string;   // visual notes
  referenceImageUrl?: string;
}

interface Scene {
  id: string;
  title: string;
  estimatedLengthSeconds: number; // 2–8 inclusive
  characters: Character[];        // total (characters + objects) <= 3
  objects: AdObject[];
  settingDescription: string;     // scene setting
  sceneDescriptionWithDialog: string; // <= 400 words, includes dialog of up to 1 character
}

interface SceneFrame {
  id: string;
  sceneId: string;
  description: string;           // visual description for the first frame
  referenceImageUrls: string[];  // subset from the relevant characters/objects
  frameImageUrl?: string;
}

interface SceneVideo {
  id: string;
  sceneId: string;
  veoRequestJson: any;
  videoUrl?: string;             // or local path
}

interface FinalVideo {
  stitchedVideoUrl: string;      // or local path
  sceneOrder: string[];          // list of sceneIds
}
```

---

## 4. CLI Flow Overview

High-level flow of the console app:

1. **Gather user inputs**
2. **Generate 3 ad concepts (via AI)**
3. **Let user choose one concept**
4. **Generate script scenes from chosen concept**
5. **Generate reference images for each character/object**
6. **Generate a start frame for each scene**
7. **Generate a video for each scene (Veo JSON + reference images)**
8. **Stitch scene videos into one final ad video**
9. **Print a summary and output file paths**

---

## 5. Step-by-Step Requirements

### 5.1 Gather User Inputs (Prompts)

Implement `promptForUserInputs()` in `prompts.js`:

* Ask for:

  * Product/service description (multiline)
  * Target audience (string)
  * Platform (string, e.g. TikTok, Instagram Reels, YouTube, etc.)
  * Brand guidelines (tone, colors, forbidden things; multiline)
  * Humor style (single-choice list):

    * Escalating Disaster
    * Expectation Subversion
    * Relatable Awkward Moment
* Return a `UserInputs` object.
* Save to `output/inputs.json`.

### 5.2 Concept Generation (3 Options)

Implement `generateAdConcepts(userInputs)` in `ai/concepts.js`:

* **API**: Use OpenAI's Chat Completions API (e.g., `gpt-4` or `gpt-4-turbo`).
* Uses OpenAI to create **exactly 3** `AdConcept` objects.
* For **each concept**:

  * `highLevelDescription` must be ≤ 300 words.
  * Provide a list of **key characters** (2–5 typical) with:

    * name, role, description
  * Provide a list of **key objects/props** (2–5 typical) with:

    * name, description
* The function should:
  * Construct a prompt that includes all `userInputs` (product description, target audience, platform, brand guidelines, humor style).
  * Request structured JSON output matching the `AdConcept[]` format.
  * Parse and validate the response to ensure exactly 3 concepts are returned.
* Persist them to `output/concepts.json`.

**CLI integration**

* In `index.js` (or `pipeline.js`):

  * Call `generateAdConcepts(userInputs)`.
  * Show the 3 concepts in an easy-to-read numbered list:

    * Title
    * Humor style resonance
    * Short teaser line
  * Ask user: “Choose a concept (1–3)”.
* Save user’s choice as `chosenConceptId` and the full chosen concept to `output/chosen-concept.json`.

### 5.3 Script Generation (Scenes)

Implement `generateScenesForConcept(chosenConcept, userInputs)` in `ai/script.js`:

* **API**: Use OpenAI's Chat Completions API (e.g., `gpt-4` or `gpt-4-turbo`).
* Output: an ordered array of `Scene` objects.

* Rules for each scene:

  * `estimatedLengthSeconds` **must** be between 2 and 8 inclusive.
  * Each scene may include:

    * Up to **3 total** characters/objects combined.
  * `settingDescription`:

    * Clear visual description of where/when the scene takes place.
  * `sceneDescriptionWithDialog`:

    * Narrative description of what visually happens.
    * Includes **dialog for up to 1 character** (not a full script for multiple voices).
    * ≤ 400 words.

* Scenes should:

  * Together form a coherent, funny ad.
  * Reflect the chosen humor style (Escalating Disaster, Expectation Subversion, or Relatable Awkward Moment).
  * Reflect platform and brand guidelines (e.g. pacing suitable for TikTok).

* The function should:
  * Construct a prompt that includes the `chosenConcept` details and `userInputs`.
  * Request structured JSON output matching the `Scene[]` format.
  * Validate that each scene meets the constraints (duration, character/object limits, word counts).

* Save scenes to `output/scenes.json`.

### 5.4 Reference Images (Characters & Objects)

Implement `generateReferenceImages(characters, objects, userInputs)` in `ai/images.js`:

* **API**: Use Replicate.com's **nano banana** model for image generation.
* For each `Character` and `AdObject` referenced in the scenes:

  * Generate **one reference image** using Replicate.
  * Set `referenceImageUrl` on the corresponding entity (this will be the Replicate output URL or downloaded file path).
* Implementation details:

  * Construct a prompt for each entity by combining:
    * Entity description (from `Character.description` or `AdObject.description`)
    * Brand guidelines (from `userInputs.brandGuidelines`)
    * Visual style requirements (e.g., "professional product photography", "character portrait", etc.)
  * Call Replicate's nano banana model with the constructed prompt.
  * Handle the async nature of Replicate predictions (polling may be required).
  * Download or store the image URL for later use in video generation.
* Save a mapping of `id -> referenceImageUrl` to `output/reference-images.json`.
* Update the `chosen-concept.json` or maintain a new structure with enriched `character` and `object` records.

### 5.5 Scene Frames (Start Frame per Scene)

Implement `generateSceneFrames(scenes, referenceImages, userInputs)` in `ai/frames.js`:

* **APIs**: 
  * Use **OpenAI's Chat Completions API** to generate the frame description text.
  * Use **Replicate.com's nano banana model** to generate the actual frame image.
* For each scene:

  * Create a `SceneFrame` that:

    * References the `sceneId`.
    * Describes the **first frame** of the scene (how it should visually look) - generated via OpenAI.
    * Includes `referenceImageUrls` pulled from the scene's characters/objects (max 3).
  * Generate a frame image using Replicate's nano banana model:
    * Construct a prompt from the `SceneFrame.description`, scene setting, and brand guidelines.
    * Call Replicate to generate the image.
    * Store the result as `frameImageUrl`.
* Save all frames to `output/scene-frames.json`.

### 5.6 Scene Video Generation (Veo 3.1 Fast)

Implement `generateSceneVideosWithVeo(scenes, frames, referenceImages)` in `ai/veo.js`:

* **API**: Use **Replicate.com's Veo 3.1 Fast model** for video generation.
* For each scene:

  * Construct a **detailed prompt and parameters** suitable for Replicate's Veo 3.1 Fast model.

  * The function should prepare:
    * A text prompt describing the scene, tone, and humor (derived from `sceneDescriptionWithDialog` and `settingDescription`).
    * The start frame image (from `SceneFrame.frameImageUrl`).
    * Reference images for characters/objects (from `referenceImageUrls`).
    * Duration (from `Scene.estimatedLengthSeconds`).
    * Output settings (resolution, fps, format).

  * Example Replicate input structure (adjust to actual Veo 3.1 Fast API spec):
    ```json
    {
      "prompt": "Short textual prompt describing the scene, tone, and humor.",
      "duration_seconds": 6,
      "start_frame_image": "https://...", // from SceneFrame.frameImageUrl
      "reference_images": [
        "https://...", // character/object reference images
        "https://..."
      ],
      "resolution": "1080x1920",
      "fps": 24
    }
    ```

  * Call Replicate's Veo 3.1 Fast model with these parameters.
  * Handle the async nature of Replicate predictions (polling may be required).
  * Store the `veoRequestJson` (the input payload) and the response video URL/path in `SceneVideo.videoUrl`.

* Save the list of `SceneVideo` objects to `output/scene-videos.json`.

### 5.7 Stitch Videos into One Ad

Implement `stitchSceneVideos(sceneVideos)` in `pipeline.js` (or a `video` utility module):

* Assumptions:

  * Either:

    * Call an external video editing API with array of `sceneVideos` in order, or
    * (For now) simulate by returning a “fake” URL/path like `output/final-ad.mp4`.
* Return a `FinalVideo` object with:

  * `stitchedVideoUrl`
  * `sceneOrder` (array of scene IDs).
* Write this to `output/final-video.json` and/or create a real `final-ad.mp4` if using a real stitcher.

---

## 6. Orchestration Logic

Implement a main orchestration function, e.g. `runPipeline()` in `pipeline.js`:

Pseudo-flow:

```js
async function runPipeline() {
  // 1. Gather inputs
  const userInputs = await promptForUserInputs();
  await saveJson("output/inputs.json", userInputs);

  // 2. Generate concepts
  const concepts = await generateAdConcepts(userInputs);
  await saveJson("output/concepts.json", concepts);

  // 3. Let user choose concept
  const chosenConcept = await promptForConceptChoice(concepts);
  await saveJson("output/chosen-concept.json", chosenConcept);

  // 4. Generate script scenes
  const scenes = await generateScenesForConcept(chosenConcept, userInputs);
  await saveJson("output/scenes.json", scenes);

  // 5. Generate reference images for referenced characters/objects
  const { charactersWithImages, objectsWithImages } =
    await generateReferenceImages(
      chosenConcept.keyCharacters,
      chosenConcept.keyObjects,
      userInputs
    );
  await saveJson("output/reference-images.json", {
    characters: charactersWithImages,
    objects: objectsWithImages,
  });

  // 6. Generate scene frames
  const frames = await generateSceneFrames(
    scenes,
    {
      characters: charactersWithImages,
      objects: objectsWithImages,
    },
    userInputs
  );
  await saveJson("output/scene-frames.json", frames);

  // 7. Generate scene videos via Veo JSON format
  const sceneVideos = await generateSceneVideosWithVeo(
    scenes,
    frames,
    { characters: charactersWithImages, objects: objectsWithImages }
  );
  await saveJson("output/scene-videos.json", sceneVideos);

  // 8. Stitch into final ad
  const finalVideo = await stitchSceneVideos(sceneVideos);
  await saveJson("output/final-video.json", finalVideo);

  // 9. Print summary
  printSummary({
    userInputs,
    chosenConcept,
    sceneCount: scenes.length,
    finalVideo,
  });
}
```

The `index.js` entry point should:

* Clear the console / show a banner (optional).
* Call `runPipeline()`.
* Handle any errors gracefully.

---

## 7. CLI UX Requirements

* Provide clear section headers in the console, for example:

  * `=== Funny Ad Video Generator ===`
  * `Step 1/6: Gather Ad Info`
  * `Step 2/6: Generate Concepts` etc.

* Where AI calls may take time, display short “working…” messages.

* After completion, show:

  * Final video path/URL.
  * Output folder location.
  * A short recap:

    * Humor style
    * Platform
    * Number of scenes
    * Concept title.

---

## 8. Testing & Stubbing

* All AI-related functions should be implemented with real API integrations:
  * `generateAdConcepts` - OpenAI Chat Completions API
  * `generateScenesForConcept` - OpenAI Chat Completions API
  * `generateReferenceImages` - Replicate nano banana model
  * `generateSceneFrames` - OpenAI (descriptions) + Replicate nano banana (images)
  * `generateSceneVideosWithVeo` - Replicate Veo 3.1 Fast model
  * `stitchSceneVideos` - Can be stubbed initially or use a video processing library

* **Required environment variables**:
  * `OPENAI_API_KEY` - For OpenAI API calls
  * `REPLICATE_API_TOKEN` - For Replicate API calls

* Error handling:
  * All API calls should include proper error handling and retry logic where appropriate.
  * Display user-friendly error messages if API keys are missing or API calls fail.
  * Consider rate limiting and API quota management.

* For development/testing:
  * Functions can optionally accept a "dry run" or "stub" mode for testing without API calls.
  * Consider caching API responses during development to reduce costs and improve iteration speed.

---

## 9. Definition of Done

* Running `node src/index.js` launches the interactive CLI.
* The user can:

  1. Enter all required inputs.
  2. See 3 concepts and choose one.
  3. Complete the full pipeline without runtime errors (with real or stubbed AI calls).
* At the end of the run, the `output/` folder contains:

  * `inputs.json`
  * `concepts.json`
  * `chosen-concept.json`
  * `scenes.json`
  * `reference-images.json`
  * `scene-frames.json`
  * `scene-videos.json`
  * `final-video.json`
  * (Optional real video files: per-scene clips + stitched final ad)

This document is the specification Cursor should use to implement the Node.js CLI script.
