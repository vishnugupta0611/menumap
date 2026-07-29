"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function processMenuImage(base64Image, mimeType) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

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
    
    let result;
    const reqPayload = [
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ];

    let retries = 3;
    let delayMs = 1500;
    
    while (retries > 0) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
        result = await model.generateContent(reqPayload);
        break; // Success
      } catch (e1) {
        if (e1.message && (e1.message.includes("503") || e1.message.includes("429") || e1.message.includes("quota"))) {
          retries--;
          if (retries === 0) {
            console.warn("Failed with gemini-3.5-flash after retries:", e1.message);
            return { error: "AI is currently experiencing high demand. Please try again in a moment." };
          }
          console.log(`Gemini API busy (${e1.message.substring(0, 40)}...). Retrying in ${delayMs}ms...`);
          await new Promise(r => setTimeout(r, delayMs));
          delayMs *= 2; // Exponential backoff
        } else {
          console.warn("Failed with gemini-3.5-flash (unrecoverable error):", e1.message);
          return { error: e1.message };
        }
      }
    }

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
    return { error: error.message || "Failed to process image with AI" };
  }
}
