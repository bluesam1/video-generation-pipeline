import { promptForUserInputs, promptForConceptChoice } from './prompts.js';
import { generateAdConcepts } from './ai/concepts.js';
import { generateScenesForConcept } from './ai/script.js';
import { generateReferenceImages } from './ai/images.js';
import { generateSceneFrames } from './ai/frames.js';
import { generateSceneVideosWithVeo } from './ai/veo.js';
import { saveJson } from './utils/io.js';
import { step, success, info, section, banner } from './utils/logging.js';

/**
 * Main pipeline orchestration function
 */
export async function runPipeline() {
  try {
    banner('FUNNY AD VIDEO GENERATOR');

    // Step 1: Gather inputs
    step(1, 8, 'Gather Ad Information');
    const userInputs = await promptForUserInputs();
    await saveJson('output/inputs.json', userInputs);
    success('User inputs saved');

    // Step 2: Generate concepts
    step(2, 8, 'Generate Ad Concepts');
    info('Generating 3 unique ad concepts using OpenAI...');
    const concepts = await generateAdConcepts(userInputs);
    await saveJson('output/concepts.json', concepts);
    success(`Generated ${concepts.length} concepts`);

    // Step 3: Let user choose concept
    step(3, 8, 'Choose Your Favorite Concept');
    const chosenConcept = await promptForConceptChoice(concepts);
    await saveJson('output/chosen-concept.json', chosenConcept);
    success(`Selected: ${chosenConcept.title}`);

    // Step 4: Generate script scenes
    step(4, 8, 'Generate Scene Breakdown');
    info('Creating scene-by-scene script...');
    const scenes = await generateScenesForConcept(chosenConcept, userInputs);
    await saveJson('output/scenes.json', scenes);
    success(`Generated ${scenes.length} scenes`);
    
    // Display scene summary
    section('Scene Summary');
    scenes.forEach((scene, idx) => {
      console.log(`${idx + 1}. ${scene.title} (${scene.estimatedLengthSeconds}s)`);
      console.log(`   Characters: ${scene.characters.map(c => c.name).join(', ') || 'None'}`);
      console.log(`   Objects: ${scene.objects.map(o => o.name).join(', ') || 'None'}`);
    });

    // Step 5: Generate reference images for referenced characters/objects
    step(5, 8, 'Generate Reference Images');
    info('Generating reference images with Replicate...');
    const { charactersWithImages, objectsWithImages } = await generateReferenceImages(
      chosenConcept.keyCharacters,
      chosenConcept.keyObjects,
      userInputs
    );
    await saveJson('output/reference-images.json', {
      characters: charactersWithImages,
      objects: objectsWithImages,
    });
    success(`Generated ${charactersWithImages.length + objectsWithImages.length} reference images`);

    // Step 6: Generate scene frames
    step(6, 8, 'Generate Scene Start Frames');
    info('Creating start frame for each scene...');
    const frames = await generateSceneFrames(
      scenes,
      {
        charactersWithImages,
        objectsWithImages,
      },
      userInputs
    );
    await saveJson('output/scene-frames.json', frames);
    success(`Generated ${frames.length} scene frames`);

    // Step 7: Generate scene videos via Veo
    step(7, 8, 'Generate Scene Videos');
    info('Generating videos with Replicate Veo 3.1 Fast...');
    info('⚠️  This step takes the longest - please be patient!');
    const sceneVideos = await generateSceneVideosWithVeo(
      scenes,
      frames,
      { charactersWithImages, objectsWithImages }
    );
    await saveJson('output/scene-videos.json', sceneVideos);
    
    const successfulVideos = sceneVideos.filter(v => v.videoUrl).length;
    success(`Generated ${successfulVideos}/${sceneVideos.length} scene videos`);

    // Step 8: Stitch into final ad
    step(8, 8, 'Stitch Final Video');
    const finalVideo = await stitchSceneVideos(sceneVideos);
    await saveJson('output/final-video.json', finalVideo);
    success('Final video ready!');

    // Print summary
    printSummary({
      userInputs,
      chosenConcept,
      sceneCount: scenes.length,
      finalVideo,
    });

    return finalVideo;
  } catch (error) {
    console.error('\n❌ Pipeline error:', error.message);
    console.error(error.stack);
    throw error;
  }
}

/**
 * Stitch scene videos into one final ad
 * For now, this creates a reference JSON file
 * In production, this would call a video editing API or use FFmpeg
 * 
 * @param {SceneVideo[]} sceneVideos - Array of scene videos
 * @returns {Promise<FinalVideo>} Final video object
 */
export async function stitchSceneVideos(sceneVideos) {
  info('Preparing final video assembly...');
  
  // Filter to only successful videos
  const validVideos = sceneVideos.filter(v => v.videoUrl);
  
  if (validVideos.length === 0) {
    throw new Error('No valid scene videos to stitch');
  }

  // For now, create a reference that lists all scene videos in order
  // In production, you would:
  // 1. Download all scene videos
  // 2. Use FFmpeg to concatenate them
  // 3. Add transitions, audio, etc.
  // 4. Upload final video
  
  const finalVideo = {
    stitchedVideoUrl: 'output/final-ad.mp4', // Placeholder
    sceneOrder: sceneVideos.map(v => v.sceneId),
    sceneVideoUrls: validVideos.map(v => v.videoUrl),
    totalScenes: sceneVideos.length,
    successfulScenes: validVideos.length,
    timestamp: new Date().toISOString(),
    status: validVideos.length === sceneVideos.length ? 'complete' : 'partial'
  };

  info(`Video assembly plan created with ${validVideos.length} scenes`);
  info('To stitch videos: use FFmpeg or a video editing API');
  info('Example: ffmpeg -i "concat:scene1.mp4|scene2.mp4" -c copy output.mp4');

  return finalVideo;
}

/**
 * Print final summary
 */
function printSummary({ userInputs, chosenConcept, sceneCount, finalVideo }) {
  banner('GENERATION COMPLETE!');
  
  console.log('📊 Summary:');
  console.log(`   Concept: ${chosenConcept.title}`);
  console.log(`   Humor Style: ${userInputs.humorStyle}`);
  console.log(`   Platform: ${userInputs.platform}`);
  console.log(`   Scenes: ${sceneCount}`);
  console.log(`   Status: ${finalVideo.status}`);
  console.log(`   Successful Videos: ${finalVideo.successfulScenes}/${finalVideo.totalScenes}`);
  
  console.log('\n📁 Output Files:');
  console.log('   output/inputs.json');
  console.log('   output/concepts.json');
  console.log('   output/chosen-concept.json');
  console.log('   output/scenes.json');
  console.log('   output/reference-images.json');
  console.log('   output/scene-frames.json');
  console.log('   output/scene-videos.json');
  console.log('   output/final-video.json');
  
  if (finalVideo.sceneVideoUrls && finalVideo.sceneVideoUrls.length > 0) {
    console.log('\n🎬 Scene Video URLs:');
    finalVideo.sceneVideoUrls.forEach((url, idx) => {
      console.log(`   ${idx + 1}. ${url}`);
    });
  }
  
  console.log('\n✨ Next Steps:');
  console.log('   1. Review the scene videos in output/scene-videos.json');
  console.log('   2. Download the videos from the URLs');
  console.log('   3. Use video editing software or FFmpeg to stitch them together');
  console.log('   4. Add music, voiceover, and final touches');
  console.log('   5. Export and share your funny ad!\n');
}

