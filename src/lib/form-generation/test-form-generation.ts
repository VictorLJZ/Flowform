console.log('Script started');
import { QuestionGenerator } from './question-generator';
import { FormGenerationConfig } from '../../types/form-generation';
import dotenv from 'dotenv';
console.log('Imports completed');

// Load environment variables with path
console.log('Loading environment from:', process.cwd());
dotenv.config({ debug: true });
console.log('Environment loaded');
console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('OPENAI') || key.includes('SUPABASE')));

// Check if API keys are available
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Error: Supabase environment variables are not set');
  process.exit(1);
}

async function testFormGeneration() {
  console.log('=== FORM GENERATION TEST WITH SUPABASE ===\n');
  
  // Sample form configuration
  const config: FormGenerationConfig = {
    starterQuestion: "What's your favorite hobby and why do you enjoy it?",
    instructions: "Create a conversational form that explores the person's interests and hobbies in depth. Ask follow-up questions that help understand their motivations and experiences.",
    temperature: 0.7,
    maxQuestions: 5
  };
  
  console.log('Form Configuration:');
  console.log('- Starter Question:', config.starterQuestion);
  console.log('- Max Questions:', config.maxQuestions);
  console.log('- Temperature:', config.temperature);
  console.log('\n');
  
  try {
    // Create a question generator
    const generator = new QuestionGenerator(config);
    
    // Initialize the form in Supabase
    const formId = await generator.initializeForm('Hobby Interest Survey', 'A survey to understand hobbies and interests');
    console.log('Form created with ID:', formId);
    
    // Start a new session
    const sessionId = await generator.startSession();
    console.log('Session started with ID:', sessionId);
    
    // Get the starter question
    console.log('=== STARTER QUESTION ===');
    console.log(generator.getStarterQuestion());
    console.log('\n');
    
    // Simulate user answers and generate follow-up questions
    const answers = [
      "I love hiking because it allows me to connect with nature and clear my mind.",
      "I usually hike in the mountains near my home, but I've also done some trails in national parks.",
      "My most memorable hike was in Yosemite last summer. The views were breathtaking.",
      "I typically go hiking once or twice a month, depending on the weather and my schedule."
    ];
    
    for (let i = 0; i < answers.length; i++) {
      console.log(`=== INTERACTION ${i + 1} ===`);
      console.log('User Answer:', answers[i]);
      
      try {
        const result = await generator.generateNextQuestion(answers[i]);
        console.log('Generated Question:', result.question);
        console.log('Is Last Question:', result.isLastQuestion);
        console.log('\n');
      } catch (error) {
        console.error(`Error generating question after answer ${i + 1}:`, error);
        console.log('\n');
      }
    }
    
    // Print the final conversation state
    console.log('=== FINAL CONVERSATION STATE ===');
    const state = generator.getConversationState();
    console.log('Questions:', state.questions.length);
    console.log('Answers:', state.answers.length);
    console.log('Current Index:', state.currentIndex);
    console.log('Form ID:', state.formId);
    console.log('Session ID:', state.sessionId);
    
    console.log('\nFull Conversation:');
    for (let i = 0; i < state.questions.length; i++) {
      console.log(`Q${i + 1}: ${state.questions[i]}`);
      if (i < state.answers.length) {
        console.log(`A${i + 1}: ${state.answers[i]}`);
      }
    }
    
    // Test loading an existing session
    console.log('\n=== TESTING SESSION LOADING ===');
    const newGenerator = new QuestionGenerator(config);
    await newGenerator.loadSession(sessionId);
    
    const loadedState = newGenerator.getConversationState();
    console.log('Loaded session state:');
    console.log('Questions:', loadedState.questions.length);
    console.log('Answers:', loadedState.answers.length);
    console.log('Current Index:', loadedState.currentIndex);
    
    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testFormGeneration();