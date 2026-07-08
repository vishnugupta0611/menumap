import { processMenuImage } from "@/app/actions/ocr-actions";

export async function extractMenuFromImage(file) {
  if (!file) {
    throw new Error("No file provided");
  }

  // Convert file to base64
  const base64Image = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const mimeType = file.type;

  console.log("OCR Service: Sending image to server action...");
  try {
    const result = await processMenuImage(base64Image, mimeType);
    console.log("OCR Service: Server action returned result:", result);
    return {
      sourceName: file.name,
      confidence: result.confidence || 0.9,
      items: result.items || [],
    };
  } catch (error) {
    console.error("OCR Service Error:", error);
    throw error;
  }
}
