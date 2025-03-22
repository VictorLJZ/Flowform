import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try to load API key directly from .env file
let apiKey = process.env.OPENAI_API_KEY;

// If API key is empty, try to read it directly from the .env file
if (!apiKey || apiKey === '') {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    console.log('Loading API key from:', envPath);
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/OPENAI_API_KEY=(.+)/);
    if (match && match[1]) {
      apiKey = match[1].trim();
      console.log('API key loaded directly from .env file');
    }
  } catch (err) {
    console.error('Error reading .env file:', err);
  }
}

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: apiKey || '',
});

// Log whether we have a valid API key
console.log('OpenAI client initialized with API key:', apiKey ? 'Valid key found' : 'No valid key found');

export default openai;