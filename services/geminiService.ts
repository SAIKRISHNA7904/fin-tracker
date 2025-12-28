import { GoogleGenAI } from "@google/genai";
import { Transaction } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (transactions: Transaction[], userQuery: string): Promise<string> => {
  try {
    const transactionSummary = JSON.stringify(transactions.slice(-100)); // Limit to last 100 for token efficiency
    
    const prompt = `
      You are an expert financial advisor. The currency is Indian Rupees (₹).
      Here is a JSON list of my recent transactions:
      ${transactionSummary}

      Based on this data, please answer the following question or provide advice:
      "${userQuery}"

      Keep the answer concise, practical, and formatted in Markdown. If the user asks for a summary, categorize spending.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while analyzing your finances. Please check your API key or try again later.";
  }
};