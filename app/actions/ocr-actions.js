"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function processMenuImage(base64Image, mimeType) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the latest gemini-3.5-flash for 2026
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

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
      Infer the "veg" field (boolean) based on dish name (e.g. paneer is veg, chicken is non-veg).
      Make sure it's valid JSON only.
    `;

    console.log("OCR Action: Calling Gemini API...", { mimeType, imageLength: base64Image?.length });
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    let text = response.text();
    console.log("OCR Action: Received raw text from Gemini:", text.substring(0, 500) + (text.length > 500 ? '...' : ''));
    
    // Clean up potential markdown formatting (e.g., ```json ... ```)
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    const parsedJson = JSON.parse(text);
    console.log("OCR Action: Successfully parsed JSON");
    return parsedJson;
  } catch (error) {
    console.error("OCR Action Critical Error:", error);
    throw new Error("Failed to process menu image: " + error.message);
  }
}
