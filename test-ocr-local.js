const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function test() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("No API key");
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Read local image
    const imagePath = "C:\\Users\\vishn\\Downloads\\Restaurant-Food-Menu-Design-in-Photoshop.jpg";
    if (!fs.existsSync(imagePath)) {
      console.log("Image not found at", imagePath);
      return;
    }
    
    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
    
    const prompt = `
      You are an expert OCR and menu parser.
      Analyze this menu image and extract the menu items into a structured format.
      Return the output as a clean JSON object without markdown formatting.
      The JSON object should match this structure:
      {
        "confidence": 0.95,
        "items": [
          {
            "name": "Dish Name",
            "category": "Starters",
            "price": 250,
            "veg": true,
            "description": "Short description of the dish"
          }
        ]
      }
    `;

    console.log("Trying gemini-3.5-flash...");
    
    let result;
    const reqPayload = [
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
    ];

    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    
    // Implement retry logic
    let retries = 3;
    let delay = 2000;
    
    while (retries > 0) {
      try {
        result = await model.generateContent(reqPayload);
        break; // Success
      } catch (err) {
        console.error(`Attempt failed: ${err.message}`);
        if (err.message.includes("503") || err.message.includes("429")) {
          retries--;
          if (retries === 0) throw err;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          delay *= 2; // Exponential backoff
        } else {
          throw err; // Not a rate limit / 503 error, throw immediately
        }
      }
    }

    const response = await result.response;
    console.log(response.text());
    
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
