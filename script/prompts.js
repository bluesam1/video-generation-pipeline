import inquirer from 'inquirer';

/**
 * Gather all user inputs for the ad video generation
 * @returns {Promise<UserInputs>} User inputs object
 */
export async function promptForUserInputs() {
  const answers = await inquirer.prompt([
    {
      type: 'editor',
      name: 'productDescription',
      message: 'Enter your product/service description:',
      default: 'A revolutionary task management app that uses AI to prioritize your day.',
      validate: (input) => input.trim().length > 0 || 'Product description is required'
    },
    {
      type: 'input',
      name: 'targetAudience',
      message: 'Who is your target audience?',
      default: 'Busy professionals aged 25-45',
      validate: (input) => input.trim().length > 0 || 'Target audience is required'
    },
    {
      type: 'list',
      name: 'platform',
      message: 'Which platform is this ad for?',
      choices: [
        'TikTok',
        'Instagram Reels',
        'YouTube Shorts',
        'YouTube',
        'Facebook',
        'Other'
      ],
      default: 'TikTok'
    },
    {
      type: 'editor',
      name: 'brandGuidelines',
      message: 'Enter your brand guidelines (tone, colors, forbidden elements):',
      default: 'Professional yet friendly tone. Use blue and white colors. Avoid controversial topics.',
      validate: (input) => input.trim().length > 0 || 'Brand guidelines are required'
    },
    {
      type: 'list',
      name: 'humorStyle',
      message: 'Choose your humor style:',
      choices: [
        'Escalating Disaster',
        'Expectation Subversion',
        'Relatable Awkward Moment'
      ],
      default: 'Expectation Subversion'
    }
  ]);

  return answers;
}

/**
 * Let user choose one of three ad concepts
 * @param {AdConcept[]} concepts - Array of 3 concepts
 * @returns {Promise<AdConcept>} Chosen concept
 */
export async function promptForConceptChoice(concepts) {
  console.log('\n📋 Generated Ad Concepts:\n');
  
  concepts.forEach((concept, index) => {
    console.log(`${index + 1}. ${concept.title}`);
    console.log(`   ${concept.highLevelDescription.substring(0, 150)}...`);
    console.log(`   Characters: ${concept.keyCharacters.length} | Objects: ${concept.keyObjects.length}\n`);
  });

  const { choiceIndex } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choiceIndex',
      message: 'Choose a concept:',
      choices: concepts.map((c, i) => ({
        name: `${i + 1}. ${c.title}`,
        value: i
      }))
    }
  ]);

  return concepts[choiceIndex];
}

