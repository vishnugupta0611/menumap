import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { processMenuImage } from './app/actions/ocr-actions.js';

async function run() {
  console.log("Testing processMenuImage...");
  // Dummy 1x1 pixel base64 image
  const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const mimeType = "image/png";
  
  try {
    const result = await processMenuImage(dummyBase64, mimeType);
    console.log("Success:", result);
  } catch (error) {
    console.error("Test Failed:", error);
  }
}

run();
