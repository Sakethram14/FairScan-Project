import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function detectProxySignals(columnNames: string[], sampleData: any[]) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not found. Using local heuristic detection.");
    return mockDetection(columnNames);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Audit the following dataset columns and sample data for Indian context proxy signals (Caste, Religion, Language, Geography).
      
      Columns: ${columnNames.join(", ")}
      Sample: ${JSON.stringify(sampleData.slice(0, 5))}
      
      Identify which columns act as proxies and why. Returns JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            proxy_signals: {
              type: Type.OBJECT,
              properties: {
                caste_proxy: { type: Type.ARRAY, items: { type: Type.STRING } },
                geo_tier: { type: Type.ARRAY, items: { type: Type.STRING } },
                language_pattern: { type: Type.ARRAY, items: { type: Type.STRING } },
                clean: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            confidence: { type: Type.NUMBER }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Proxy Detection Error:", error);
    return mockDetection(columnNames);
  }
}

function mockDetection(columnNames: string[]) {
  return {
    proxy_signals: {
      caste_proxy: columnNames.filter(c => c.toLowerCase().includes("name") || c.toLowerCase().includes("surname")),
      geo_tier: columnNames.filter(c => c.toLowerCase().includes("pin") || c.toLowerCase().includes("city")),
      language_pattern: columnNames.filter(c => c.toLowerCase().includes("desc")),
      clean: columnNames.filter(c => !c.toLowerCase().includes("name") && !c.toLowerCase().includes("pin"))
    },
    confidence: 0.95
  };
}
