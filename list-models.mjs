import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // Actually @google/generative-ai SDK doesn't expose listModels directly easily on the client object,
    // let's just fetch it via standard fetch using the key
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(data.models.map(m => m.name).join("\n"));
  } catch (error) {
    console.error("Error fetching models", error);
  }
}
listModels();
