"use client";

import { useMutation } from "@tanstack/react-query";
import { extractMenuFromImage } from "@/services/ocr-service";

export function useMenuOcr() {
  return useMutation({
    mutationFn: extractMenuFromImage,
  });
}
