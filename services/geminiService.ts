
import { GoogleGenAI } from "@google/genai";

export class GeminiFashionService {
  /**
   * LANGKAH 1: Menganalisis gambar model dan baju untuk membuat prompt deskriptif.
   */
  async analyzeStyle(
    modelBase64: string, 
    modelMime: string,
    outfitBase64: string,
    outfitMime: string
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', // Cepat untuk analisis teks
        contents: {
          parts: [
            { inlineData: { data: modelBase64, mimeType: modelMime } },
            { inlineData: { data: outfitBase64, mimeType: outfitMime } },
            { text: "Bertindaklah sebagai ahli fashion. Deskripsikan secara sangat detail visual gabungan jika orang di gambar 1 mengenakan pakaian di gambar 2. Deskripsikan pose, wajah, dan detail baju tersebut dalam Bahasa Inggris untuk prompt image generator. Mulai output langsung dengan 'A photorealistic shot of...'." }
          ]
        }
      });

      const prompt = response.text;
      if (!prompt) throw new Error("Gagal menganalisis gaya. AI tidak memberikan respon.");
      return prompt;
    } catch (err: any) {
      throw new Error(`Analisis Gagal: ${err.message || "Pastikan gambar yang diunggah jelas."}`);
    }
  }

  /**
   * LANGKAH 2: Menghasilkan gambar akhir menggunakan prompt dari Langkah 1.
   */
  async generateVisual(
    prompt: string,
    modelBase64: string,
    modelMime: string,
    outfitBase64: string,
    outfitMime: string
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // Model khusus untuk image context generation
        contents: {
          parts: [
            { inlineData: { data: modelBase64, mimeType: modelMime } },
            { inlineData: { data: outfitBase64, mimeType: outfitMime } },
            { text: `${prompt}. Tetap pertahankan identitas wajah model dan detail warna baju asli.` }
          ]
        },
        config: {
          imageConfig: { aspectRatio: "9:16" }
        }
      });

      let imageUrl: string | null = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) throw new Error("Gagal merender gambar. Coba lagi.");
      return imageUrl;
    } catch (err: any) {
      throw new Error(`Generasi Gagal: ${err.message || "Gagal menggabungkan gambar."}`);
    }
  }
}
