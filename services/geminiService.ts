
import { GoogleGenAI } from "@google/genai";
import { AgentRole, Transaction } from "../types";
import { AGENT_PERSONAS } from "../constants";

export const generateAgentResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  currentMessage: string,
  agentRole: AgentRole,
  searchGrounding: boolean = false
): Promise<{ text: string; sources?: any[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const config: any = { 
      systemInstruction: AGENT_PERSONAS[agentRole],
    };

    if (searchGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: currentMessage }] }
      ],
      config
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    return { text: response.text || "No response", sources };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "Error communicating with the AI Agent." };
  }
};

export const performMultiAgentConsensus = async (scenario: string, transaction: Transaction): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      ACT AS A MULTI-AGENT ROUNDTABLE.
      SCENARIO: ${scenario}
      TRANSACTION CONTEXT: ${transaction.address}, Price: $${transaction.price}, Stage: ${transaction.stage}.
      
      Generate a dialogue between:
      1. COORDINATOR (Pragmatic, timeline-focused)
      2. LEGAL (Risk-averse, compliance-focused)
      3. LOAN OFFICER (Financial stability focused)
      
      Format the output as follows:
      [CONSENSUS_REPORT]
      Recommendation: [Clear to Close / Needs Attention / High Risk]
      Risk Level: [Low/Med/High]
      Reasoning: [Detailed Bullet Points]
      Next Best Action: [Specific step]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: { 
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 1000 }
      }
    });
    return response.text || "Consensus failed to form.";
  } catch (error) {
    return "The agents are currently in a private session. Please try again.";
  }
};

export const performLegalReview = async (docName: string, docType: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a simulated deep legal audit for "${docName}" (${docType}). Scan for standard real estate contingencies: Inspection rights, financing outs, and title commitment requirements.`,
      config: { systemInstruction: AGENT_PERSONAS[AgentRole.LEGAL] }
    });
    return response.text || "No review content generated.";
  } catch (error) {
    return "Failed to perform legal review.";
  }
};

// LIVE API UTILS
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export function float32To16BitPCM(float32Arr: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Arr.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Arr.length; i++) {
    let s = Math.max(-1, Math.min(1, float32Arr[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
