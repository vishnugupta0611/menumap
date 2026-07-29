import { processMenuImage } from "@/app/actions/ocr-actions";

export async function extractMenuFromImage(file) {
  if (!file) {
    throw new Error("No file provided");
  }

  // Compress image before sending to avoid Next.js payload limits
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Max dimensions for OCR (Gemini handles 1500-2000px perfectly)
          const MAX_DIMENSION = 1600;
          if (width > height && width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          } else if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.8 quality
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          // Return just the base64 part
          resolve(dataUrl.split(",")[1]);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const base64Image = await compressImage(file);
  const mimeType = "image/jpeg";

  console.log("OCR Service: Sending image to server action...");
  try {
    const result = await processMenuImage(base64Image, mimeType);
    console.log("OCR Service: Server action returned result:", result);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
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
