const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function checkModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env.local");
    return;
  }
  
  try {
    console.log("Fetching models...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("AVAILABLE MODELS:");
      data.models.forEach(m => {
        console.log(`- ${m.name}`);
        console.log(`  Methods: ${m.supportedGenerationMethods?.join(", ")}`);
      });
    } else {
      console.log("Error response:", data);
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

checkModels();
