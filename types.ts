
export interface FashionImage {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

export interface BoutiqueItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  base64: string;
}

export type GenerationStep = 'idle' | 'analyzing' | 'generating' | 'error' | 'success';

export interface GenerationState {
  step: GenerationStep;
  error: string | null;
  resultImage: string | null;
  debugPrompt: string | null;
}
