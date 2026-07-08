import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Load env from .env.local manually for a quick script test
const envContent = fs.readFileSync(".env.local", "utf-8");
let apiKey = "";
envContent.split("\n").forEach(line => {
  if (line.startsWith("GEMINI_API_KEY=")) {
    apiKey = line.split("=")[1].trim();
  }
});

const genAI = new GoogleGenerativeAI(apiKey);

async function checkModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("AVAILABLE MODELS:");
    if (data.models) {
      data.models.forEach(m => console.log(m.name, "-", m.supportedGenerationMethods?.join(", ")));
    } else {
      console.log(data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

checkModels();
